/// <reference path="./Local.ts" />

interface Module {
	e: {[key: string]: any}
	p: string[]
	m: Function,
	r: boolean
}

const modules: {[key: string]: Module} = {}
function define(moduleName: string, passThings: string[], module: Function) {
	modules[moduleName] = {e: {}, p: passThings, m: module, r: false}
	return moduleName
}

async function getExports(n: string) {
	console.log("Getting exports for:", n)
	if (!(n in modules)) {
		console.log("Module '" + n + "' not found!")
		await Local.loadModule(n)
	}
	console.log(modules)
	const m = modules[n]
	if (m.r) return m.e
	m.m(...await Promise.all(m.p.map(async t => {
		let r =
			t == "require" ? require :
			t == "exports" ? m.e :
			t == "module" ? m :
			(await getExports(t.replace(/^[.\/]*|(\.\.\/)+[^.]*?\/|\..+?$/g, "")))
		return r
	})))
	return m.e
}

function require(moduleName: string, found: (m: {[key: string]: any}) => any, notFound: (err: string) => any): string {
	moduleName = moduleName.replace(/^[.\/]*|(\.\.\/)+[^.]*?\/|\..+?$/g, "")
	console.log("Required:", moduleName)
	if (!(moduleName in modules)) notFound("Module `" + moduleName + "` not found!")
	getExports(moduleName).then(found)
	return moduleName
}

