#![allow(dead_code)]
#![allow(unused_imports)]
pub mod vec;
pub mod gl;
pub mod physics;
pub mod renderer;
pub mod object_holder;
pub mod scene;
pub mod glass;
pub mod log;

// macro_rules! log {
// 	($a1:expr) => { console_log($a1); };
// 	($a1:expr, $a2:expr) => { console_log($a1); console_log($a2); };
// }
use vec::*;
use gl::*;
use physics::*;
use renderer::*;
use object_holder::*;
use scene::*;
use glass::*;
use log::*;