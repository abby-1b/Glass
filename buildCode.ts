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
lazy_static = "1.4.0"
rand = "0.8"
[features]
bin = []
` // glium = "*"

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
	wasm.main()
	let t = 0
	const frm = () => {
		wasm.wasm_step_frame((performance.now() - t) / 16.666)
		t = performance.now()
		window.requestAnimationFrame(frm)
	}
	frm()
})
window.onresize = () => { getUint8Memory0()[gls[0]] = 1 }
		</script>
	</body>
</html>
`

const MAIN_FILE = `
#[macro_use]
extern crate lazy_static;
mod drops;
use drops::*;
#[allow(unused_imports)]
use log::*;
use glass::*;

mod project;

#[wasm_bindgen]
pub fn main() {
	GLASS.lock().unwrap().set_setup_fn(project::setup);
	GLASS.lock().unwrap().set_frame_fn(project::frame);
	GLASS.lock().unwrap().set_physics_fn(project::physics);
	GLASS.lock().unwrap().init();
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

export const fns: {[key: string]: {modify: () => string, build: (fileName: string, outName: string) => Promise<number>}} = {
	"bin": {
		modify: (): string => {
			// return "#[macro_use]\nextern crate lazy_static;\n" + code + "\nfn main() {\n" + INIT_FNS + "\n}"
			return MAIN_FILE
		},
		build: async (fileName: string, outName: string): Promise<number> => {
			await Deno.writeTextFile("Cargo.toml", CARGO_TOML.replace(/%%/g, fileName))
			// const ret = await Deno.run({cmd: ["rustc", fileName, "-o", outName, "--cfg", "to=\"bin\""]}).status()
			const dr = outName.split("/").slice(0, -1).join("/")
			const ret = await Deno.run({cmd: ["cargo", "build", "--target-dir", dr, "--features", "bin"]}).status()
			await Deno.writeFile(outName, await Deno.readFile(dr + "/debug/glass_eng"))
			await Deno.run({cmd: ["chmod", "u+x", outName]}).status()
			try { await Deno.remove(dr + "/debug") } catch (e) { [] }
			try { await Deno.remove(dr + "/.rustc_info.json") } catch (e) { [] }
			return ret.code
		}
	},
	"web": {
		modify: (): string => {
			return "use wasm_bindgen::prelude::*;\n"
				+ MAIN_FILE
				+ "\n#[wasm_bindgen]"
				+ "\npub fn wasm_step_frame(delta: f32) {"
				+ "\n\tGLASS.lock().unwrap().frame(delta);"
				+ "\n}"
		},
		build: async (fileName: string, outName: string): Promise<number> => {
			await Deno.writeTextFile("Cargo.toml", WEB_TOML.replace(/%%/g, fileName))
			const ret = await Deno.run({cmd: ["wasm-pack", "build", "--target", "web"]}).status()
			await Deno.writeTextFile(outName + ".html", HTML_TEMPLATE.replace("%%",
				minifyJS(await Deno.readTextFile("pkg/glass_engine.js"))))
			await Deno.writeFile(outName.split("/").slice(0, -1).join("/") + "/glass_engine_bg.wasm",
				await Deno.readFile("pkg/glass_engine_bg.wasm"))
			// try { await Deno.remove("pkg") } catch (_e) { [] }
			return ret.code
		}
	}
}