
use crate::drops::*;
use crate::glass::*;
use crate::vec::*;
use crate::renderer::*;
use crate::physics::*;
use crate::log::*;

pub fn setup(ins: &mut GlassStruct) {
	let x = (ins.gl.width as f32) / 2.0;
	let y = (ins.gl.height as f32) / 2.0;
	ins.get_curr_scene().object_holder.add_object(
		Some(Vec2::new(x, y)),
		Some(Vec2::new(10.0, 10.0)),
		Some(SpriteRenderer::new()),
		Some(Physics::new()),
	);
}

pub fn frame(_delta: f32, ins: &mut GlassStruct) {
	// ins.gl.colorf(1.0, 0.0, 0.0, 1.0);
	// ins.gl.rect(10.0, 10.0, 50.0, 50.0);
	// log!(&ins.get_curr_scene().object_holder.component_position[0].as_ref().unwrap().to_string());
	if ins.frame_count % 60 == 0 {
		let x = ins.rand();
		let y = ins.rand();
		ins.get_curr_scene().object_holder.component_physics[0].as_mut().unwrap().velocity.add_vec(&Vec2::new(x, y).normalize_ret());
	}
}

pub fn physics(_delta: f32, _ins: &mut GlassStruct) {
	
}
