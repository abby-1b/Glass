mod drops;
use drops::*;
use log::*;

pub fn main() {
	if let Ok(mut ins) = glass::new() {
		ins.frame(frame);
		ins.physics(physics);
		ins.init();
	}
}

pub fn frame(_delta: i32, _ins: glass::Glass) {
	
}

pub fn physics(_delta: i32, _ins: glass::Glass) {

}
