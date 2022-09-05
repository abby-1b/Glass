// Sl stands for "simple language"

// cls Test {
// 	let prop = 10
// 	// fn new() {
// 	// 	print("Made new instance!")
// 	// }

// 	fn tst(num: i32) {
// 		print("Hey!")
// 		print(num)
// 	}
// }

let E = (271828182f / 100000000f)

fn randNormal(): f32 {
	return rand() * 2f - 1f
}

fn randomize(ws: f32[][][]) {
	let b: f32 = (1f / 100f)
	return [
		[ [ws[0][0][0] + b * randNormal(), ws[0][0][1] + b * randNormal()], [ws[0][1][0] + b * randNormal(), ws[0][1][1] + b * rand()], [ws[0][2][0] + b * rand(), ws[0][2][1] + b * rand()] ],
		[ [ws[1][0][0] + b * randNormal(), ws[1][0][1] + b * randNormal(), ws[1][0][0] + b * randNormal()] ]
	]
}

fn activation(v: f32): f32 {
	return 1f / (1f + pow(E, 0f - v)) //1f / (1f + E ** (0f - v))
}
fn forward(ws: f32[][][], a: f32, b: f32): f32 {
	let dat = [a, b]
	
	dat = [
		activation(dat[0] * ws[0][0][0] + dat[1] * ws[0][0][1]),
		activation(dat[0] * ws[0][1][0] + dat[1] * ws[0][1][1]),
		activation(dat[0] * ws[0][2][0] + dat[1] * ws[0][2][1])
	]
	dat = [
		activation(dat[0] * ws[1][0][0] + dat[1] * ws[1][0][1] + dat[2] * ws[1][0][2])
	]
	return dat[0]
}

fn loss(ws: f32[][][]): f32 {
	let l = 0f
	let v = 0f

	v = 0 - forward(ws, 0f, 0f)
	l = l + v * v

	v = 1 - forward(ws, 1f, 0f)
	l = l + v * v

	v = 1 - forward(ws, 0f, 1f)
	l = l + v * v

	v = 0 - forward(ws, 1f, 1f)
	l = l + v * v

	return l
}

fn main() {
	let ws = [[ [0f, 0f], [0f, 0f], [0f, 0f] ], [ [0f, 0f, 0f] ]]

	for e in 0..10 {
		let nws = randomize(ws)

		let oldLoss = loss(ws)
		let newLoss = loss(nws)
		if newLoss < oldLoss {
			ws = nws
			print(newLoss)
		}
	}

	for a in 0..10 {
		print(a + activation(a))
	}
	// print(forward(ws, 0f, 0f))
	// print(forward(ws, 1f, 0f))
	// print(forward(ws, 0f, 1f))
	// print(forward(ws, 1f, 1f))

	// let size = [2, 3, 1]
	// size.push(10)
	// let a = 10
	// for b in a..20 {
	// 	print(b)
	// }
	// let weights: f32[][] = [[0f]]
}
