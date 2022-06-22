
#[cfg(feature = "bin")]
#[macro_export]
macro_rules! log {
	($a1:expr) => { println!($a1); };
	($a1:expr, $a2:expr) => { print!($a1); println($a2) };
}

#[cfg(not(feature = "bin"))]
use wasm_bindgen::prelude::*;

#[cfg(not(feature = "bin"))]
#[cfg_attr(not(feature = "bin"), wasm_bindgen)]
extern {
	#[wasm_bindgen(js_namespace = console, js_name = log)]
	pub fn console_log(s: &str);
}
#[cfg(not(feature = "bin"))]
#[macro_export]
macro_rules! log {
	($a1:expr) => { console_log($a1); };
	($a1:expr, $a2:expr) => { console_log($a1); console_log($a2); };
}

pub use log;
