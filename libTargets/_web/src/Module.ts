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
	if (!(n in modules)) {
		try {
			await Local.loadModule(n)
		} catch (e) {
			return new Error("Module '" + n + "'not found")
		}
	}
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
	getExports(moduleName).catch(notFound).then(found)
	return moduleName
}

