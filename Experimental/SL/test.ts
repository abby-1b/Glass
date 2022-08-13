
type A = { propA: number }
function A__new(): A {
	let r: A = {
		propA: 0
	}
	return r
}
function A__methodA(A: A) {
	return "ok (A)"
}

type B = { propB: string }
type C = A & B


// class A {
// 	propA: number = 10
// 	methodA() {
// 		return "ok (A)"
// 	}
// }

// class B {
// 	propB: string = "hey (b)"
// 	methodB() {
// 		return 20
// 	}
// }

// class C {
// 	run() {
// 		console.log(this)
// 	}
// }

// const c = new C()
// c.run()
