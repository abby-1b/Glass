#![cfg(not(feature = "bin"))]
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlShader, WebGlUniformLocation};

#[allow(unused_imports)]
use crate::log::*;

struct Uniforms {
	pub color: Option<WebGlUniformLocation>,
	pub screen_scale: Option<WebGlUniformLocation>,
}
impl Uniforms {
	pub fn new() -> Uniforms {
		Uniforms {
			color: None,
			screen_scale: None,
		}
	}

	pub fn init(&mut self, ctx: &WebGl2RenderingContext,  prg: &WebGlProgram) {
		self.color = ctx.get_uniform_location(prg, "color");
		self.screen_scale = ctx.get_uniform_location(prg, "screen_scale");
	}
}

pub struct Graphics {
	context: WebGl2RenderingContext,
	program: Option<WebGlProgram>,
	vertex_arr: [f32; 8],

	real_size: bool,
	window_was_resized: u8,
	pub width: u16,
	pub height: u16,

	current_color: [f32; 4],
	uniforms: Uniforms,
}

#[wasm_bindgen]
extern {
	#[wasm_bindgen(js_namespace = gls)]
	fn export_var(var_pos: usize, var: u8);
}

impl Graphics {
	pub fn new() -> Result<Graphics, JsValue> {
		let document = web_sys::window().unwrap().document().unwrap();
		let canvas = document.get_element_by_id("cnv").unwrap();
		let canvas_el: web_sys::HtmlCanvasElement = canvas.dyn_into::<web_sys::HtmlCanvasElement>()?;
		let ctx = canvas_el
			.get_context("webgl2")?
			.unwrap()
			.dyn_into::<WebGl2RenderingContext>()?;
		let ret = Graphics {
			context: ctx,
			program: None,
			vertex_arr: [0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0],

			real_size: true,
			window_was_resized: 1,
			width: 100,
			height: 100,

			current_color: [1.0, 1.0, 1.0, 1.0],
			uniforms: Uniforms::new(),
		};
		Ok(ret)
	}

	fn resized(&mut self) {
		let wnd = web_sys::window().unwrap();
		let inner_width  = wnd.inner_width().unwrap().as_f64().ok_or(100f64).unwrap();
		let inner_height = wnd.inner_height().unwrap().as_f64().ok_or(100f64).unwrap();
		if self.real_size {
			self.width  = inner_width as u16;
			self.height = inner_height as u16;
		} else {
			let m = f64::sqrt(640000f64 / (inner_width * inner_height));
			self.width  = (inner_width * m) as u16;
			self.height = (inner_height * m) as u16;
		}
		self.context.uniform2fv_with_f32_array(
			self.uniforms.screen_scale.as_ref(),
			&[2.0 / self.width as f32, -2.0 / self.height as f32]);
		let canvas = web_sys::window().unwrap().document().unwrap().get_element_by_id("cnv").unwrap().dyn_into::<web_sys::HtmlCanvasElement>().unwrap();
		canvas.set_width(self.width.into());
		canvas.set_height(self.height.into());
		self.context.viewport(0, 0, self.width.into(), self.height.into());
		log!("Resized.");
		self.window_was_resized = 0;
	}

	fn update_buf(&self) {
		unsafe {
			let positions_array_buf_view = js_sys::Float32Array::view(&self.vertex_arr);
			self.context.buffer_data_with_array_buffer_view(
				WebGl2RenderingContext::ARRAY_BUFFER,
				&positions_array_buf_view,
				WebGl2RenderingContext::STATIC_DRAW,
			);
		}
	}

	fn update_shader_color(&mut self, is_texture: bool) {
		if is_texture { self.current_color[3] = self.current_color[3].abs() * -1f32; }
		else { self.current_color[3] = self.current_color[3].abs(); }
		self.context.uniform4fv_with_f32_array(self.uniforms.color.as_ref(), &self.current_color)
	}

	pub fn colorf(&mut self, r: f32, g: f32, b: f32, a: f32) {
		self.current_color[0] = r;
		self.current_color[1] = g;
		self.current_color[2] = b;
		self.current_color[3] = a;
	}

	pub fn color(&mut self, r: Option<f32>, g: Option<f32>, b: Option<f32>, a: Option<f32>) {
		if r.is_none()		{ self.current_color[0] = 1.0; self.current_color[1] = 1.0; self.current_color[2] = 1.0; self.current_color[3] = 1.0; }
		else if g.is_none() { self.current_color[0] = r.unwrap(); self.current_color[1] = r.unwrap(); self.current_color[2] = r.unwrap(); self.current_color[3] = 1.0; }
		else if b.is_none() { self.current_color[0] = r.unwrap(); self.current_color[1] = r.unwrap(); self.current_color[2] = r.unwrap(); self.current_color[3] = g.unwrap(); }
		else if a.is_none() { self.current_color[0] = r.unwrap(); self.current_color[1] = g.unwrap(); self.current_color[2] = b.unwrap(); self.current_color[3] = 1.0; }
		else				{ self.current_color[0] = r.unwrap(); self.current_color[1] = g.unwrap(); self.current_color[2] = b.unwrap(); self.current_color[3] = a.unwrap(); }
	}

	pub fn rect(&mut self, x: f32, y: f32, w: f32, h: f32) {
		self.vertex_arr[0] = x;
		self.vertex_arr[1] = y;
		self.vertex_arr[2] = x + w;
		self.vertex_arr[3] = y;
		self.vertex_arr[4] = x;
		self.vertex_arr[5] = y + h;
		self.vertex_arr[6] = x + w;
		self.vertex_arr[7] = y + h;
		self.update_buf();
		self.update_shader_color(false);
		self.context.draw_arrays(WebGl2RenderingContext::TRIANGLE_STRIP, 0, 4);
	}

	pub fn init_frame(&mut self) {
		if self.window_was_resized != 0 { self.resized(); }
		self.context.clear_color(0.0, 0.0, 0.0, 1.0);
		self.context.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);
	}

	pub fn init(&mut self) -> Result<(), JsValue> {
		export_var((&self.window_was_resized) as *const _ as usize, 0);
		self.program = Some(compile_program(&self.context,
			r##"#version 300 es
			in vec2 vertex_pos;
			out vec2 tex_pos;
			uniform vec2 screen_scale;
			uniform float tex_info[6];

			void main() {
				tex_pos = vertex_pos.xy - vec2(tex_info[0], tex_info[1]);
				gl_Position = vec4(vertex_pos * screen_scale - vec2(1.0, -1.0), 0.0, 1.0);
			}
			"##,
			r##"#version 300 es
			precision highp float;
			out vec4 out_color;
			in vec2 tex_pos;
			uniform sampler2D the_tex;
			uniform vec4 color;
			uniform float tex_info[6];

			void main() {
				if (color.w < 0.0) {
					out_color = texture(the_tex, (floor(tex_pos) + 0.5) * vec2(tex_info[4], tex_info[5]) + vec2(tex_info[2], tex_info[3])) * vec4(color.r, color.g, color.b, -color.a);
				} else { out_color = color; }
			}
			"##)?);
		self.uniforms.init(&self.context, self.program.as_ref().unwrap());
		self.context.use_program(Some(&self.program.as_ref().unwrap()));

		let position_attribute_location = self.context.get_attrib_location(&self.program.as_ref().unwrap(), "vertex_pos");
		let buffer = self.context.create_buffer().ok_or("Failed to create buffer")?;
		self.context.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, Some(&buffer));

		let vao = self.context
			.create_vertex_array()
			.ok_or("Could not create vertex array object")?;
		self.context.bind_vertex_array(Some(&vao));
	
		self.context.enable_vertex_attrib_array(position_attribute_location as u32);
		self.context.vertex_attrib_pointer_with_i32(0, 2, WebGl2RenderingContext::FLOAT, false, 0, 0);
	
		self.context.bind_vertex_array(Some(&vao));

		self.resized();
		Ok(())
	}
}

fn compile_program(
	context: &WebGl2RenderingContext,
	vert_shader_code: &str,
	frag_shader_code: &str,
) -> Result<WebGlProgram, String> {
	let program = context
		.create_program()
		.ok_or_else(|| String::from("Unable to create shader program."))?;

	context.attach_shader(&program, &compile_shader(
		&context,
		WebGl2RenderingContext::VERTEX_SHADER,
		vert_shader_code,
	)?);
	context.attach_shader(&program, &compile_shader(
		&context,
		WebGl2RenderingContext::FRAGMENT_SHADER,
		frag_shader_code,
	)?);
	context.link_program(&program);

	if context
		.get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS)
		.as_bool()
		.unwrap_or(false) {
		Ok(program)
	} else {
		log!("Error compiling program:",
			&context
			.get_program_info_log(&program)
			.unwrap_or_else(|| String::from("Unknown error creating program object"))[..]);
		Err(context
			.get_program_info_log(&program)
			.unwrap_or_else(|| String::from("Unknown error creating program object")))
	}
}

fn compile_shader(
	context: &WebGl2RenderingContext,
	shader_type: u32,
	source: &str,
) -> Result<WebGlShader, String> {
	let shader = context
		.create_shader(shader_type)
		.ok_or_else(|| String::from("Unable to create shader object"))?;
	context.shader_source(&shader, source);
	context.compile_shader(&shader);
	if context.get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS).as_bool().unwrap_or(false) {
		Ok(shader)
	} else {
		log!("Error compiling shader:",
			&context
			.get_shader_info_log(&shader)
			.unwrap_or_else(|| String::from("Unknown error creating shader"))[..]);
		Err(context
			.get_shader_info_log(&shader)
			.unwrap_or_else(|| String::from("Unknown error creating shader")))
	}
}