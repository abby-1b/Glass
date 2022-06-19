use vec::*;
use physics::*;
use renderer::*;

pub struct EntityHolder {
	component_position: Vec<Option<Vec2>>,
	component_renderer: Vec<Option<Renderer>>,
	component_physics: Vec<Option<Physics>>,

	holder_physics: ScenePhysics,
}

impl EntityHolder {
	pub fn new() -> EntityHolder {
		EntityHolder {
			component_position: Vec::new(),
			component_renderer: Vec::new(),
			component_physics: Vec::new(),

			holder_physics: ScenePhysics { friction: Vec2::new(0.99, 0.99) }
		}
	}
}
