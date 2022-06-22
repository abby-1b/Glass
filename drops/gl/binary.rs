// use glium::{glutin, Surface};

#[allow(unused_imports)]
use crate::log::*;

pub struct Graphics {
	width: u16,
	height: u16,
}
impl Graphics {
	pub fn new() -> Result<Graphics, ()> {
		Ok(Graphics {
			width: 100,
			height: 100
		})
	}

	pub fn init(&self) {
		log!("Starting GL...");
		// let event_loop = glutin::event_loop::EventLoop::new();
		// let wb = glutin::window::WindowBuilder::new();
		// let cb = glutin::ContextBuilder::new();
		// let display = glium::Display::new(wb, cb, &event_loop).unwrap();

		// event_loop.run(move |event, _, control_flow| {

		// });
	}

	pub fn init_frame(&self) {

	}

	pub fn rect(&mut self, _x: f32, _y: f32, _w: f32, _h: f32) {

	}
}