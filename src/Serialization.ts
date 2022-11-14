/// <reference path="Loader.ts" />

/** Serializes objects into a string. */
class Serializer {
	private static defaults: {[key: string]: any} = {}
	private static references: any[] = []

	/** Serializes an object into JSON format. */
	static serialize(obj: any) {
		let ret = this.serializeObject(obj).slice(3, -1)
		ret = this.references.map(r => this.serializeKey(r.constructor.name)).join(",") + "\n" + ret
		this.defaults = {}, this.references = []
		return ret
	}

	private static serializeObject(obj: any): string {
		let isArray = false

		// Deal with literals
		if (obj === undefined) return "u"
		const objType: string = obj.constructor.name
		if (objType == "String") return '"' + obj.replace(/"/g, "\\\"") + '"'
		else if (objType == "Boolean") return obj ? "t" : "f"
		else if (objType == "Number") return obj % 1 == 0 ? obj : ("#" + this.floatToString(obj))
		else if (objType == "Array") isArray = true

		// If already in reference, return that.
		if (this.references.includes(obj)) return "@" + this.references.indexOf(obj)

		// Get unique keys
		if (!(objType in this.defaults))
			this.defaults[objType] = this.instanceOfConstructor(obj.constructor as ObjectConstructor)
		const keys = Object.keys(obj)
		keys.push(...Object.entries(Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(obj)))
			.filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
			.map(e => e[0]))

		let ret = "@" + this.references.length.toString(36) + (isArray ? "[" : "{")
		this.references.push(obj)
		let m = false
		for (let i = 0; i < keys.length; i++) {
			if (obj[keys[i]] != this.defaults[objType][keys[i]]
				|| !(keys[i] in this.defaults[objType])) {
				if (obj[keys[i]].constructor.name == "WebGLTexture" || keys[i][0] == '_') continue
				ret += (isArray ? "" : (this.serializeKey(keys[i]) + ":")) + this.serializeObject(obj[keys[i]]) + ","
				m = true
			}
		}
		// console.log(keys)

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
		return i[0].toString(36)
	}

	private static instanceOfConstructor(cns: typeof Object) {
		return new cns()
	}
}

/** De-serializes a string into an object. */
class DeSerializer {
	private static refs: any[] = []
	private static data: string

	static deSerialize(d: string) {
		this.data = "," + d
		while (this.data[0] != "\n") this.data = this.data.slice(1), this.refs.push(this.makeInstance(this.getKey()))
		let isArr = Array.isArray(this.refs[0])
		this.data = (isArr ? "@0[" : "@0{") + this.data.slice(1) + (isArr ? "]" : "}")
		this.parseObject()
		return this.refs[0]
	}

	private static parseObject() {
		let obj = this.refs[parseInt(this.getKey().slice(1), 36)]
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
			} else if (this.data[0] == "t" || this.data[0] == "f") obj[k] = this.data[0] == "t", this.data = this.data.slice(1)
			else if (this.data[0] == "w") obj[k] = this.makeInstance("WebGLTexture"), this.data = this.data.slice(1)
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

// setTimeout(() => {
// 	let d = Serializer.serialize(GlassRoot.children)
// 	console.log(d)
// 	DeSerializer.deSerialize(d)
// }, 300)
