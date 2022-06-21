
#[cfg(to = "bin")]
#[macro_export]
macro_rules! log {
	($l:expr) => { println!($l); }
}

#[cfg(not(to = "bin"))]
use wasm_bindgen::prelude::*;

#[cfg(not(to = "bin"))]
#[cfg_attr(not(to = "bin"), wasm_bindgen)]
extern {
	#[wasm_bindgen(js_namespace = console, js_name = log)]
	pub fn console_log(s: &str);
}
#[cfg(not(to = "bin"))]
#[macro_export]
macro_rules! log {
	($l:expr) => { console_log($l); }
}

pub use log;
