pub struct Vec2 { pub x: f32, pub y: f32 }
macro_rules! expr { ($e:expr) => { $e } }
macro_rules! Vec2_arithmetic {
	($name:tt, $name_vec:tt, $name_ret:tt, $op:tt, $op_eq:tt) => {
		pub fn $name(&mut self, x: f32, y: f32) { expr!(self.x $op_eq x); expr!(self.y $op_eq y); }
		pub fn $name_vec(&mut self, v: &Vec2) { expr!(self.x $op_eq v.x); expr!(self.y $op_eq v.y); }
		pub fn $name_ret(&mut self, x: f32, y: f32) -> Vec2 { Vec2 { x: expr!(self.x $op x), y: expr!(self.y $op y) } }
	};
}
impl Vec2 {
	pub fn new(x: f32, y: f32) -> Vec2 { Vec2 { x: x, y: y } }
	Vec2_arithmetic!(add, add_vec, add_ret, +, +=);
	Vec2_arithmetic!(sub, sub_vec, sub_ret, -, -=);
	Vec2_arithmetic!(mul, mul_vec, mul_ret, *, *=);
	Vec2_arithmetic!(div, div_vec, div_ret, /, /=);
	pub fn pow(&mut self, b: f32) { self.x = self.x.powf(b); self.y = self.y.powf(b); }
	pub fn pow_ret(&mut self, b: f32) -> Vec2 { Vec2 { x: self.x.powf(b), y: self.y.powf(b) } }

	pub fn to_string(&self) -> String { return format!("Vec2( {}, {} )", self.x, self.y); }
}