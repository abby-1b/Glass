
/**
 * Injects functions before or after execution of class methods.
 * Works on either the class level (for all instances) or the instance level (for a single instance).
 */
class Inject {
	/**
	 * Injects a function that runs before any class method.
	 * Works even afer objects have been instanced from said class.
	 * **NOTE: Injecting to a class after injecting to an instance doesn't have any effect.**
	 * @param cls The class to inject into
	 * @param nm The name of the function to inject
	 * @param fn The function to be ran. Returning void keeps the function running. Returning a tuple with [true, arg] will return from the function early with `arg` as the return value.
	 */
	public static class<T>(cls: { new (...args: any[]): T; }, nm: string, fn: (...args: any[]) => [boolean, any] | void) {
		const rfn = cls.prototype[nm]
		cls.prototype[nm] = (function(this: T, ...args: any[]) {
			const ret = fn.bind(this)(...args)
			if (ret && ret[0]) return ret[1]
			return rfn.bind(this)(...args)
		})
	}

	/**
	 * Injects a function that runs after any class method.
	 * Works even afer objects have been instanced from said class.
	 * **NOTE: Injecting to a class after injecting to an instance doesn't have any effect.**
	 * @param cls The class to inject into
	 * @param nm The name of the function to inject
	 * @param fn The function to be ran
	 */
	public static classAfter<T>(cls: { new (...args: any[]): T; }, nm: string, fn: (ret: any, ...args: any[]) => unknown) {
		const rfn = cls.prototype[nm]
		cls.prototype[nm] = (function(this: T, ...args: any[]) {
			return fn.bind(this)(rfn.bind(this)(...args), ...args)
		})
	}

	/**
	 * Injects a function that runs before any instance method.
	 * @param inst The class to inject into
	 * @param nm The name of the function to inject
	 * @param fn The function to be ran. Returning void keeps the function running. Returning a tuple with [true, arg] will return from the function early with `arg` as the return value.
	 */
	public static instance(inst: {[key: string]: any}, nm: string, fn: (...args: any[]) => [boolean, any] | void) {
		const rfn = inst[nm]
		inst[nm] = (function(this: any, ...args: any[]) {
			const ret = fn.bind(this)(...args)
			if (ret && ret[0]) return ret[1]
			return rfn.bind(this)(...args)
		})
	}

	/**
	 * Injects a function that runs after any instance method.
	 * @param inst The class to inject into
	 * @param nm The name of the function to inject
	 * @param fn The function to be ran
	 */
	public static instanceAfter(inst: any, nm: string, fn: (...args: any[]) => unknown) {
		const rfn = inst[nm]
		inst[nm] = (function(this: any, ...args: any[]) {
			return fn.bind(this)(rfn.bind(this)(...args), ...args)
		})
	}
}

/// TEST

class A {
	public prop = 0
	public someFn(_arg: number) {
		this.prop += 1
	}
}

const inst1 = new A()
const inst2 = new A()

// This runs before `someFn` on every instance.
// Keep in mind this works even when injected after the instances are made.
Inject.classAfter(A, "someFn", function(this: A, _ret: void, arg: number) {
	this.prop += 1
	console.log("Class arguments:", arg)
	return arg
})

// This runs before `someFn` only on inst1
Inject.instance(inst1, "someFn", function(this: A, ...arg: any[]) {
	this.prop += 1
	console.log("Instance arguments:", arg)
})

// Run the functions. Notice no further work is required, the functions are called normally.
console.log()
console.log("inst1 returned:", inst1.someFn(123))
console.log()
console.log("inst2 returned:", inst2.someFn(321))

// The first instance runs the class injection, then the instance injection, then the original function, so it results in 3.
console.log("inst1:", inst1.prop)

// The second instance runs only the class injection before the original function, so it results in 2.
console.log("inst2:", inst2.prop)
