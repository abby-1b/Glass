use std::sync::Mutex;
use crate::scene::*;
use crate::log::*;

#[cfg(to = "bin")]
use crate::gl::binary::Graphics;
#[cfg(not(to = "bin"))]
use crate::gl::web::Graphics;

pub struct GlassStruct {
	pub gl: Graphics,
	scenes: Vec<Scene>,
	frame_fn: Option<fn(i32, &mut GlassStruct) -> ()>,
	physics_fn: Option<fn(i32, &mut GlassStruct) -> ()>,

	pub frame_count: u64,
}

impl GlassStruct {
	pub fn new() -> Result<GlassStruct, ()> {
		if let Ok(gl) = Graphics::new() {
			Ok(GlassStruct {
				gl: gl,
				scenes: Vec::new(),
				frame_fn: None,
				physics_fn: None,

				frame_count: 0,
			})
		} else {
			log!("Error initializing GL.");
			Err(())
		}
	}

	pub fn set_frame_fn(&mut self, f: fn(i32, &mut GlassStruct) -> ()) {
		self.frame_fn = Some(f);
	}

	pub fn set_physics_fn(&mut self, f: fn(i32, &mut GlassStruct) -> ()) {
		self.physics_fn = Some(f);
	}

	pub fn init(&mut self) {
		self.gl.init();
	}

	pub fn frame(&mut self) {
		self.frame_count += 1;
		self.gl.init_frame();
		if self.frame_fn.is_some() { self.frame_fn.unwrap()(16, self); }
	}

	pub fn physics(&mut self) {
		if self.physics_fn.is_some() { self.physics_fn.unwrap()(16, self); }
	}
}
unsafe impl Send for GlassStruct {}

// static Glass: SyncLazy<Mutex<Vec<u8>>> = SyncLazy::new(|| Mutex::new(vec![]));
lazy_static! {
	pub static ref Glass: Mutex<GlassStruct> = Mutex::new(GlassStruct::new().unwrap());
}
