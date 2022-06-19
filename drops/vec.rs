pub struct Vec2 { pub x: f32, pub y: f32 }
macro_rules! expr { ($e:expr) => { $e } }
macro_rules! Vec2_arithmetic {
	($name:tt, $name_vec:tt, $op:tt) => {
		pub fn $name(&mut self, x: f32, y: f32) { expr!(self.x $op x); expr!(self.y $op y); }
		pub fn $name_vec(&mut self, v: Vec2) { expr!(self.x $op v.x); expr!(self.y $op v.y); }
	};
}
impl Vec2 {
	pub fn new(x: f32, y: f32) -> Vec2 { Vec2 { x: x, y: y } }
	Vec2_arithmetic!(add, add_vec, +=);
	Vec2_arithmetic!(sub, sub_vec, -=);
	Vec2_arithmetic!(mul, mul_vec, *=);
	Vec2_arithmetic!(div, div_vec, /=);

	pub fn to_string(&self) -> String { return format!("Vec2( {}, {} )", self.x, self.y); }
}