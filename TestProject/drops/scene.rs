use crate::vec::*;
use crate::object_holder::*;

#[cfg(feature = "bin")]
use crate::gl::binary::Graphics;
#[cfg(not(feature = "bin"))]
use crate::gl::web::Graphics;

pub struct Scene {
	pub pos: Vec2,
	pub size: Vec2,
	pub object_holder: ObjectHolder,
}
impl Scene {
	pub fn new() -> Scene {
		Scene {
			pos: Vec2::new(0.0, 0.0),
			size: Vec2::new(100.0, 100.0),
			object_holder: ObjectHolder::new()
		}
	}

	pub fn do_physics(&mut self, delta: f32) {
		for idx in 0..self.object_holder.component_position.len() {
			let vel = &mut self
				.object_holder
				.component_physics[idx]
				.as_mut()
				.unwrap()
				.velocity;
			vel.mul_vec(&self.object_holder.holder_physics.friction.pow_ret(delta));
			let pos = &mut self.object_holder.component_position[idx].as_mut().unwrap();
			pos.add_vec(&vel.mul_ret(delta, delta));

		}
		// for (idx, pos) in self.object_holder.component_position.iter_mut().enumerate() {
		// 	let vel = &self
		// 		.object_holder
		// 		.component_physics[idx]
		// 		.as_ref()
		// 		.unwrap()
		// 		.velocity;
		// 	if pos.is_some() {
		// 		pos.as_mut().unwrap().add_vec(vel);
		// 	}
		// }
	}

	pub fn render(&self, gl: &mut Graphics) {
		for (idx, obj) in self.object_holder.component_renderer.iter().enumerate() {
			if obj.is_some() { obj.as_ref().unwrap().render(gl, &self.object_holder, idx); }
		}
	}
}
