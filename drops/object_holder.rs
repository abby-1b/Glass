use crate::vec::*;
use crate::physics::*;
use crate::renderer::*;

pub struct ObjectHolder {
	pub component_position: Vec<Option<Vec2>>,
	pub component_size: Vec<Option<Vec2>>,
	pub component_renderer: Vec<Option<Renderer>>,
	pub component_physics: Vec<Option<Physics>>,

	pub holder_physics: ScenePhysics,
}

impl ObjectHolder {
	pub fn new() -> ObjectHolder {
		ObjectHolder {
			component_position: Vec::new(),
			component_size: Vec::new(),
			component_renderer: Vec::new(),
			component_physics: Vec::new(),

			holder_physics: ScenePhysics { friction: Vec2::new(0.98, 0.98) }
		}
	}

	pub fn add_object(&mut self,
		comp_position: Option<Vec2>,
		comp_size: Option<Vec2>,
		comp_renderer: Option<Renderer>,
		comp_physics: Option<Physics>,
	) {
		self.component_position.push(comp_position);
		self.component_size.push(comp_size);
		self.component_renderer.push(comp_renderer);
		self.component_physics.push(comp_physics);
	}
}
