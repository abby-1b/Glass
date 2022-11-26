
interface Module {
	e: {[key: string]: any}
	p: string[]
	m: Function,
	r: boolean
}

const modules: {[key: string]: Module} = {}
function define(moduleName: string, passThings: string[], module: Function) {
	modules[moduleName] = {e: {}, p: passThings, m: module, r: false}
}

function getExports(n: string) {
	const m = modules[n]
	if (m.r) return m.e
	m.m(...m.p.map(t => {
		let r =
			t == "require" ? require :
			t == "exports" ? m.e :
			t == "module" ? m :
			getExports(t)
		return r
	}))
	return m.e
}

function require(moduleName: string, found: Function, notFound: Function) {
	if (!(moduleName in modules)) notFound("Module `" + moduleName + "` not found!")
	found(getExports(moduleName))
}

