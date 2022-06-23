use wasm_bindgen::prelude::*;

#[macro_use]
extern crate lazy_static;
mod drops;
use drops::*;
#[allow(unused_imports)]
use log::*;
use glass::*;

mod project;

#[wasm_bindgen]
pub fn main() {
	GLASS.lock().unwrap().set_setup_fn(project::setup);
	GLASS.lock().unwrap().set_frame_fn(project::frame);
	GLASS.lock().unwrap().set_physics_fn(project::physics);
	GLASS.lock().unwrap().init();
}

#[wasm_bindgen]
pub fn wasm_step_frame(delta: f32) {
	GLASS.lock().unwrap().frame(delta);
}