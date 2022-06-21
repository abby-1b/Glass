// Library interface with any graphics libraries on the frontend, independent on what it's interacting with.
// It even exposes some advanced APIs (like shaders) that aren't available in every renderer (like JS Canvas).

#[cfg(to = "bin")]
pub mod binary;
#[cfg(not(to = "bin"))]
pub mod web;