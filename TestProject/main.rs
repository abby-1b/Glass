mod drops;
use drops::*;

pub fn main() {
	let mut ins = glass::new();
	ins.frame(frame);
	ins.physics(physics);
}

pub fn frame(_delta: i32, ins: glass::Glass) {
	
}

pub fn physics(_delta: i32, ins: glass::Glass) {

}
