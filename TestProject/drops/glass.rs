use std::sync::Mutex;
use crate::scene::*;
use crate::log::*;

#[cfg(feature = "bin")]
use crate::gl::binary::Graphics;
#[cfg(not(feature = "bin"))]
use crate::gl::web::Graphics;

pub struct GlassStruct {
	pub gl: Graphics,
	on_scene: usize,
	scenes: Vec<Scene>,
	setup_fn: Option<fn(&mut GlassStruct) -> ()>,
	frame_fn: Option<fn(f32, &mut GlassStruct) -> ()>,
	physics_fn: Option<fn(f32, &mut GlassStruct) -> ()>,

	rand_num: f32,
	pub frame_count: u64,
}

impl GlassStruct {
	pub fn new() -> Result<GlassStruct, ()> {
		if let Ok(gl) = Graphics::new() {
			Ok(GlassStruct {
				gl: gl,
				on_scene: 0,
				scenes: Vec::new(),
				setup_fn: None,
				frame_fn: None,
				physics_fn: None,

				rand_num: 0.5,
				frame_count: 0,
			})
		} else {
			log!("Error initializing GL.");
			Err(())
		}
	}

	pub fn rand(&mut self) -> f32 {
		self.rand_num = (self.rand_num * 9e9f32 + 0.01).sin();
		self.rand_num
	}

	pub fn set_setup_fn(&mut self, f: fn(&mut GlassStruct) -> ()) {
		self.setup_fn = Some(f);
	}

	pub fn set_frame_fn(&mut self, f: fn(f32, &mut GlassStruct) -> ()) {
		self.frame_fn = Some(f);
	}

	pub fn set_physics_fn(&mut self, f: fn(f32, &mut GlassStruct) -> ()) {
		self.physics_fn = Some(f);
	}

	pub fn init(&mut self) {
		if self.gl.init().is_err() { log!("Error initializing GL!"); }
		self.scenes.push(Scene::new());
		if self.setup_fn.is_some() { self.setup_fn.unwrap()(self); }
	}

	pub fn frame(&mut self, delta: f32) {
		self.physics(delta);
		self.physics(delta);
		self.frame_count += 1;
		self.gl.init_frame();
		self.scenes[self.on_scene].render(&mut self.gl);
		if self.frame_fn.is_some() { self.frame_fn.unwrap()(delta, self); }
	}

	pub fn physics(&mut self, delta: f32) {
		self.scenes[self.on_scene].do_physics(delta);
		if self.physics_fn.is_some() { self.physics_fn.unwrap()(delta, self); }
	}

	pub fn get_curr_scene(&mut self) -> &mut Scene {
		&mut self.scenes[self.on_scene]
	}
}
unsafe impl Send for GlassStruct {}

// static Glass: SyncLazy<Mutex<Vec<u8>>> = SyncLazy::new(|| Mutex::new(vec![]));
lazy_static! {
	pub static ref GLASS: Mutex<GlassStruct> = Mutex::new(GlassStruct::new().unwrap());
}
