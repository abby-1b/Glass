use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlShader, WebGlUniformLocation};

#[allow(unused_imports)]
use crate::log::*;

pub struct Graphics {
	context: WebGl2RenderingContext,
	program: Option<WebGlProgram>,
	vertex_arr: [f32; 8],

	real_size: bool,
	window_was_resized: u8,
	width: u16,
	height: u16,
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
		};
		Ok(ret)
	}

	fn resized(&mut self) -> Result<(), JsValue> {
		if let wnd = web_sys::window().unwrap() {
			let inner_width  = wnd.inner_width().unwrap().as_f64().ok_or(100f64)?;
			let inner_height = wnd.inner_height().unwrap().as_f64().ok_or(100f64)?;
			if self.real_size {
				self.width  = inner_width as u16;
				self.height = inner_height as u16;
			} else {
				let m = f64::sqrt(640000f64 / (inner_width * inner_height));
				self.width  = (inner_width * m) as u16;
				self.height = (inner_height * m) as u16;
			}
			self.context.uniform2fv_with_f32_array(
				self.context.get_uniform_location(&self.program.as_ref().unwrap(), "screen_scale").as_ref(),
				&[2.0 / self.width as f32, -2.0 / self.height as f32]);
			let canvas = web_sys::window().unwrap().document().unwrap().get_element_by_id("cnv").unwrap().dyn_into::<web_sys::HtmlCanvasElement>()?;
			canvas.set_width(self.width.into());
			canvas.set_height(self.height.into());
			self.context.viewport(0, 0, self.width.into(), self.height.into());
			log!("Resized.");
		}
		self.window_was_resized = 0;
		Ok(())
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
				//tex_pos = vertex_pos.xy - vec2(tex_info[0], tex_info[1]);
				gl_Position = vec4(vertex_pos * screen_scale - vec2(1.0, -1.0), 0.0, 1.0);
			}
			"##,
			r##"#version 300 es
			precision highp float;
			out vec4 out_color;
			in vec2 tex_pos;
			uniform sampler2D the_tex;
			uniform vec4 color;
			uniform float texInfo[6];

			void main() {
				out_color = vec4(1.0, 0.0, 0.0, 1.0);
				// if (color.w < 0.0) {
					// out_color = texture(the_tex, (floor(texPos) + 0.5) * vec2(texInfo[4], texInfo[5]) + vec2(texInfo[2], texInfo[3])) * vec4(color.r, color.g, color.b, -color.a);
				// } else { out_color = color; }
			}
			"##)?);
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
		log!("Error compiling program:");
		log!(&context
			.get_program_info_log(&program)
			.unwrap_or_else(|| String::from("Unknown error creating program object"))[..]);
		Err(context
			.get_program_info_log(&program)
			.unwrap_or_else(|| String::from("Unknown error creating program object")))
	}
}

pub fn compile_shader(
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
		log!("Error compiling shader:");
		log!(&context
			.get_shader_info_log(&shader)
			.unwrap_or_else(|| String::from("Unknown error creating shader"))[..]);
		Err(context
			.get_shader_info_log(&shader)
			.unwrap_or_else(|| String::from("Unknown error creating shader")))
	}
}