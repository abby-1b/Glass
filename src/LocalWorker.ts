/// NOTE: This code borrows HEAVILY from Freelancer, a JavaScript library that
/// is basically this. Link: [https://github.com/Wildhoney/Freelancer]

class LocalWorker {
	/**
	 * Run a function on a 'different thread' by using a Worker. Passed options
	 * will be serialized using JSON.stringify, so no passing by reference.
	 * Circular references will also cause issues. If the browser has no
	 * instance of `Worker`, the function will be ran as normal on the main thread.
	 * @param fn The function to be ran
	 * @param args The arguments to be passed to the function
	 */
	static async runFunction<T, U extends readonly unknown[]>(fn: (...args: U) => T, ...args: [...U]): Promise<Awaited<T>> {
		// Fallback
		if (!globalThis.Worker)
			return await fn(...args)

		const url = URL.createObjectURL(new Blob([`
				self.addEventListener('message', async e => {
					self.postMessage(await (${fn.toString()})(...e.data))
				})
			`], {type: "application/javascript"})) // Create URL
			, worker = new Worker(url) // Create worker

		return new Promise((resolve: (v: Awaited<T>) => void, reject) => {
			worker.onmessage = (e: MessageEvent<Awaited<T>>) => resolve(e.data)
			worker.postMessage(args)
		})
	}
}
