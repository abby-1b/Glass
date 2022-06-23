#[cfg(feature = "bin")]
use crate::gl::binary::Graphics;
#[cfg(not(feature = "bin"))]
use crate::gl::web::Graphics;
use crate::object_holder::*;

pub struct SpriteRenderer {}
impl SpriteRenderer {
	pub fn new() -> Renderer {
		Renderer::SpriteRenderer(SpriteRenderer {

		})
	}

	pub fn render(&self, gl: &mut Graphics, holder: &ObjectHolder, idx: usize) {
		let pos = holder.component_position[idx].as_ref().unwrap();
		let size = holder.component_size[idx].as_ref().unwrap();
		gl.colorf(1.0, 1.0, 1.0, 1.0);
		gl.rect(pos.x, pos.y, size.x, size.y);
	}
}

pub enum Renderer {
	SpriteRenderer(SpriteRenderer),
}

impl Renderer {
	pub fn render(&self, gl: &mut Graphics, holder: &ObjectHolder, idx: usize) {
		match self {
			Renderer::SpriteRenderer(rr) => rr.render(gl, holder, idx),
		}
	}
}
