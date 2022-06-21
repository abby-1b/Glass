mod drops;
use drops::*;
use log::*;
use glass::*;

pub fn frame(_delta: i32, ins: &mut GlassStruct) {
	// log!("Hello, World!");
	ins.gl.rect(10.0, 10.0, 20.0, 20.0);
}

pub fn physics(_delta: i32, _ins: &mut GlassStruct) {

}
