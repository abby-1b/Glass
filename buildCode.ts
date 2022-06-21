const WEB_TOML = `[package]
name = "glass_engine"
version = "1.0.0"
edition = "2021"
[[bin]]
name = "glass_eng"
path = "%%"
[lib]
path = "%%"
opt-level = "z"
crate-type = ["cdylib"]
[dependencies]
lazy_static = "1.4.0"
js-sys = "0.3.58"
wasm-bindgen = "0.2"
[dependencies.web-sys]
version = "0.3.4"
features = [
  'Document',
  'Element',
  'HtmlCanvasElement',
  'WebGlBuffer',
  'WebGlVertexArrayObject',
  'WebGl2RenderingContext',
  'WebGlUniformLocation',
  'WebGlProgram',
  'WebGlShader',
  'Window',
]`

const CARGO_TOML = `[package]
name = "glass_engine"
version = "1.0.0"
edition = "2021"
[[bin]]
name = "glass_eng"
path = "%%"
[lib]
path = "%%"
opt-level = "z"
crate-type = ["cdylib"]
[dependencies]
wasm-bindgen = "0.2"`

const HTML_TEMPLATE = `
<html>
	<head>
		<meta charset="utf-8">
		<title>Glass Engine</title>
	</head>
		<body style="margin:0;overflow:hidden;">
		<canvas id="cnv" style="width:100vw;height:100vh"></canvas>
		<script>
%%
let gls = {
	export_var: (pos, ofv) => gls[ofv] = pos
}
init().then(()=>{
	wasm.wasm_main()
	const frm = () => {
		wasm.wasm_step_frame()
		window.requestAnimationFrame(frm)
	}
	frm()
})
window.onresize = () => { cachedUint8Memory0[gls[0]] = 1 }
console.log(gls)
		</script>
	</body>
</html>
`

const WEB_EXPORT_FNS = `
#[wasm_bindgen]
pub fn wasm_main() {
	Glass.lock().unwrap().set_frame_fn(frame);
	Glass.lock().unwrap().set_physics_fn(physics);
	Glass.lock().unwrap().init();
}
#[wasm_bindgen]
pub fn wasm_step_frame() {
	Glass.lock().unwrap().frame();
}
#[wasm_bindgen]
pub fn wasm_step_physics() {
	Glass.lock().unwrap().physics();
}
`

// A simple minification function to reduce file size of wasm-bindgen
function minifyJS(code: string): string {
	return code
		.replace(/\nexport function/g, "\nfunction")
		.replace("export { initSync }", "")
		.replace("export default init;", "")
		.replace("import.meta.url", "window.location.href")
	// return code.split("\n")
	// 	.map(e => e.trim())
	// 	.filter(e => e.length > 0)
	// 	.join("\n")
	// 	.replace(/(}\n){1,}/g,e=>e.replace(/\n/g,"")+"\n")
}

export const fns: {[key: string]: {modify: (code: string) => string, build: (fileName: string, outName: string) => Promise<number>}} = {
	"bin": {
		modify: (code: string): string => {
			return code
		},
		build: async (fileName: string, outName: string): Promise<number> => {
			await Deno.writeTextFile("Cargo.toml", CARGO_TOML.replace(/%%/g, "drops/main.rs"))
			const ret = await Deno.run({cmd: ["rustc", fileName, "-o", outName, "--cfg", "to=\"bin\""]}).status()
			return ret.code
		}
	},
	"web": {
		modify: (code: string): string => {
			return "#[macro_use]\nextern crate lazy_static;\nuse wasm_bindgen::prelude::*;\n"
				+ code
				+ WEB_EXPORT_FNS
		},
		build: async (fileName: string, outName: string): Promise<number> => {
			await Deno.writeTextFile("Cargo.toml", WEB_TOML.replace(/%%/g, fileName))
			const ret = await Deno.run({cmd: ["wasm-pack", "build", "--target", "web"]}).status()
			await Deno.writeTextFile(outName + ".html", HTML_TEMPLATE.replace("%%",
				minifyJS(await Deno.readTextFile("pkg/glass_engine.js"))))
			await Deno.writeFile(outName.split("/").slice(0, -1).join("/") + "/glass_engine_bg.wasm",
				await Deno.readFile("pkg/glass_engine_bg.wasm"))
			try { await Deno.remove("pkg") } catch (_e) { [] }
			return ret.code
		}
	}
}