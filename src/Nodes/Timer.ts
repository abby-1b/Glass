/// <reference path="GlassNode.ts" />

/** Animates a property on a node. NOTE: putting the node to be animated as a children of this node causes a one-frame delay in its animation. */
class TimerNode extends GlassNode {
	/** The signal to be fired when the timer is completed. */
	signal?: string
	/** The total time (in frames) the timer should be running for. */
	totalTime = 0
	/** The current time left (in frames) until the timer is completed. */
	timeLeft = 0
	/** Wether or not to repeat the timer after it's completed */
	repeat = false

	loop() {
		if (this.timeLeft == 0) return
		if (this.timeLeft-- == 0) {
			if (this.repeat) this.timeLeft = this.totalTime
			if (this.signal) Signal.trigger(this.signal, this)
		}
	}

	/** Starts the timer */
	start(time = this.totalTime) {
		this.totalTime = time
		this.timeLeft = this.totalTime
	}
}
