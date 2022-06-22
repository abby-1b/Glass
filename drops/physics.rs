use crate::vec::*;

pub struct Physics {
	pub velocity: Vec2,
	pub mass: f32,
}
impl Physics {
	pub fn new() -> Physics {
		Physics {
			velocity: Vec2::new(5.0, 0.0),
			mass: 1.0
		}
	}
}

pub struct ScenePhysics {
	pub friction: Vec2,
}
impl ScenePhysics {
	pub fn run_physics(&self) { }
}
