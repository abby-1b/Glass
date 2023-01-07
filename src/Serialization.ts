/// <reference path="./Nodes/GlassNode.ts" />

/** Serializes objects into a string. */
class Serializer {
	private static references: any[] = []

	/** Serializes an object into JSON format. */
	static serialize(obj: any) {
		// Serialize the object and remove its outer syntax (it's inferrable)
		let ret: string = this.serializeObject(obj).slice(3, -1)

		// Serialize its reference names
		let refStr: string[] = []
		for (let i = 0; i < this.references.length; i++) {
			let k = this.serializeKey(this.references[i].constructor.name)
			const idx = refStr.indexOf(k)
			if (idx == -1)
				refStr.push(k)
			else
				refStr.push("@" + idx.toString(36))
		}

		ret = refStr.join(",") + "\n" + ret
		this.references = []
		return ret
	}

	private static serializeObject(obj: any): string {
		let isArray = false

		// If the object is the glass root, don't repeat it.
		if (obj == GlassRoot) return "r"

		// Deal with literals
		if (obj == undefined) return "u"
		const objType: string = obj.constructor.name
		if (objType == "String") return '"' + obj.replace(/"/g, "\\\"") + '"'
		else if (objType == "Boolean") return obj ? "t" : "f"
		else if (objType == "Number") return this.floatToString(obj)
		else if (objType == "Array") isArray = true

		// If already in reference, return that.
		if (this.references.includes(obj)) return "@" + this.references.indexOf(obj)

		// Get unique keys
		const keys: Set<string> = new Set()
		if (obj instanceof GlassNode) {
			// If the object is a GlassNode, use its `saveProperties`
			let c = obj.constructor
			while (c.name != "")
				(<any>c).saveProperties.forEach((p: string) => keys.add(p)), c = (<any>c).__proto__
		} else {
			// Otherwise, save every key that's
			Object.keys(obj).forEach(p => keys.add(p))
			Object.entries(Object
				.getOwnPropertyDescriptors(Reflect.getPrototypeOf(obj)))
				.filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
				.map(e => keys.add(e[0]))
		}

		// Put all of its properties into a single string, recursively serializing objects inside of it
		let ret = "@" + this.references.length.toString(36) + (isArray ? "[" : "{")
		this.references.push(obj)
		let m = false
		for (const k of keys) {
			if (obj[k] != undefined && obj[k].constructor.name == "WebGLTexture" || k[0] == '_') continue
			ret += (isArray ? "" : (this.serializeKey(k) + ":")) + this.serializeObject(obj[k]) + ","
			m = true
		}

		// If its modified, remove the last comma and close with the proper syntax.
		// Otherwise, remove the original opening syntax ("{" or "[").
		if (m) return ret.slice(0, -1) + (isArray ? "]" : "}")
		else return ret.slice(0, -1)
	}

	private static serializeKey(k: string) {
		// TODO: if a key has a space/un-allowed character, wrap it in quotes.
		return k
	}

	private static floatToString(n: number) {
		const buf = new ArrayBuffer(8)
			, f = new Float64Array(buf)
			, i = new BigUint64Array(buf)
		f[0] = n
		const ret = i[0].toString(36)

		// If the string representation is simple (a.k.a takes up less space than the full float
		// representation) and accurate (can be expressed as a small number and doesn't have any
		// weird floating point inconsistencies) just save it as human-readable. Otherwise send
		// this representation of float.
		if (Number.isNaN(n) || ((n + "").length < ret.length + 1 && parseFloat(n + "") == n))
			return n + ""
		else
			return "#" + ret
	}
}

/** De-serializes a string into an object. */
class DeSerializer {
	private static refs: any[] = []
	private static data: string

	/** De-serializes a string into an object (with support for circular dependencies) */
	static deSerialize(d: string) {
		// Parse the object names into an array of references to these objects.
		this.data = "," + d
		const names: string[] = []
		while (this.data[0] != "\n") {
			this.data = this.data.slice(1)
			let k = this.getKey()
			if (k[0] == "@") k = names[parseInt(k.slice(1))]
			names.push(k)
			this.refs.push(this.makeInstance(k))
		}

		// Check if the main object is an array.
		let isArr = Array.isArray(this.refs[0])

		// If it is, pad it with the array syntax. Otherwise, use object syntax.
		this.data = (isArr ? "@0[" : "@0{") + this.data.slice(1) + (isArr ? "]" : "}")

		// Then, parse the string into an object.
		this.parseObject()

		// Save the returned object
		const ret = this.refs[0]

		// Empty out the references
		while (this.refs.length > 0) this.refs.pop()

		return ret
	}

	private static parseObject() {
		let obj = this.refs![parseInt(this.getKey().slice(1), 36)]
			, close = this.data[0] == "{" ? "}" : "]"
			, isArray = close == "]"
			, arrayIdx = 0
		if (!"{[".includes(this.data[0])) return obj
		this.data = this.data.slice(1)
		let i = 0
		while (this.data[0] != close) {
			if (++i > 20) throw new Error("Too deep!")
			let k: string
			if (isArray) k = "" + (arrayIdx++)
			else k = this.getKey(), this.data = this.data.slice(1)
			if (this.data[0] == "@") obj[k] = this.parseObject()
			else if (this.data[0] == '"') {
				// TODO: do a good string reading algorithm
				this.data = this.data.slice(1)
				let s = this.data.slice(0, this.data.indexOf('"'))
				this.data = this.data.slice(s.length + 1)
				obj[k] = s
			} else if (this.data[0] == "u") obj[k] = undefined, this.data = this.data.slice(1)
			else if (this.data[0] == "t" || this.data[0] == "f") obj[k] = this.data[0] == "t", this.data = this.data.slice(1)
			else if (this.data[0] == "w") obj[k] = this.makeInstance("WebGLTexture"), this.data = this.data.slice(1)
			else if (this.data[0] == "#") obj[k] = this.stringToFloat(this.getKey().slice(1))
			else if (this.data[0] == "r") obj[k] = GlassRoot, this.data = this.data.slice(1)
			else obj[k] = parseFloat(this.getKey())
			// TODO: implement serialized float to float conversion

			if (this.data[0] == ",") this.data = this.data.slice(1)
		}
		this.data = this.data.slice(1)
		return obj
	}

	private static getKey(): string {
		let ret = ""
		let inStr = this.data[0] == '"'
		if (inStr) this.data = this.data.slice(1)
		while (!",:[]{}\"\n".includes(this.data[0])) ret += this.data[0], this.data = this.data.slice(1)
		if (inStr) this.data = this.data.slice(1)
		return ret
	}

	private static makeInstance(nm: string): Object {
		if (!nm.match(/^[a-zA-Z0-9_]+$/)) throw new Error("ACE not allowed!")
		if (nm == "Array") return []
		return new (<any>eval(nm))()
	}

	private static stringToFloat(s: string) {
		const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz"
			, buf = new ArrayBuffer(8), i = new BigUint64Array(buf), f = new Float64Array(buf)
		i[0] = Array.prototype.reduce.call(s, (acc: any, digit: string) => {
			const pos = BigInt(alphabet.indexOf(digit))
			return acc * 36n + pos
		}, 0n) as bigint
		return f[0]
	}
}
