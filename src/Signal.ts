
/** 
 * A signal system. Similar to JavaScript's pre-existing Event system, but without the objects.
 * 
 * Note: yes, strings are still objects in JavaScript. Let me have my microoptimization.
*/
class Signal {
	static list: {[key: string]: ((n: GlassNode) => void)[]} = {}

	/** Adds a listener for a signal. When this signal is triggered, all of the events tied to it will be ran in order. */
	static addListener(signalName: string, fn: (n: GlassNode) => void) {
		this.list[signalName] ? this.list[signalName].push(fn) : this.list[signalName] = [fn]
	}

	/** Triggers a signal by name. */
	static trigger(signalName: string, n: GlassNode) {
		if (!(signalName in this.list)) return
		for (let i = 0; i < this.list[signalName].length; i++)
			this.list[signalName][i](n)
	}
}
