use crate::vec::*;

pub struct Physics {
	velocity: Vec2,
	mass: f32,
}

pub struct ScenePhysics {
	pub friction: Vec2,
}
impl ScenePhysics {
	pub fn run_physics(&self) { }
}
