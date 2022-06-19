use gl::*;
use scene::*;

pub struct Glass {
	gl: GL,
	scenes: Vec<Scene>,
	frame_fn: Option<fn(i32, Glass) -> ()>,
	physics_fn: Option<fn(i32, Glass) -> ()>,
}
impl Glass {
	pub fn frame(&mut self, f: fn(i32, Glass) -> ()) {
		self.frame_fn = Some(f);
	}

	pub fn physics(&mut self, f: fn(i32, Glass) -> ()) {
		self.physics_fn = Some(f);
	}
}

pub fn new() -> Glass {
	Glass {
		gl: GL { },
		scenes: Vec::new(),
		frame_fn: None,
		physics_fn: None,
	}
}
