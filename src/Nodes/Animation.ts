/// <reference path="./GlassNode.ts" />

/** Animates a property on a node. NOTE: putting the node to be animated as a child of this node causes a one-frame delay in its animation. */
class AnimationNode extends GlassNode {
	private static saveProperties = [
		"playing", "animations"
	]

	private onTime = 0
	private onFrame = 0
	private actingNode?: GlassNode
	private property?: string

	/** The name of the currently playing animation. */
	playing?: string

	/** Stores animations as name: information pairs. The information stored is: [timing, frames, doesLoop] */
	public animations: {[key: string]: [number, any[], boolean]} = {}

	/** Sets the node to be animated. NOTE: subsequent calls to this function will overwrite any previous call. */
	animate(node: GlassNode, property: string) {
		this.actingNode = node
		this.property = property
	}

	/** Plays an animation. */
	play(name: string) {
		this.playing = name
		this.onFrame = 0
		this.onTime = 0
	}

	/**
	 * Adds an animation composed of sparse keyframes.
	 * @param name Name of the animation
	 * @param timing How fast the frames should advance, expressed in frames (60fps) per animation frame. e.g. `timing = 5` means the animation will advance one frame every five game frames.
	 * @param keyframes A list of keyframes expressed as `[frameNumber, propertyValue][]`
	 * @param total The total count of frames the animation should have.
	 */
	addSparseKeyframes(name: string, timing: number, keyframes: [number, any][], total: number, playOnce = false) {
		// TODO: make this function take sparse keyframe data and fill in the blanks.
		this.animations[name] = [timing, new Array(total), playOnce]
		for (let i = 0; i < keyframes.length; i++) {
			this.animations[name][1][keyframes[i][0]] = keyframes[i][1]
		}
		let curr: any
		for (let i = 0; i < total; i++) {
			if (this.animations[name][1][i] === undefined) this.animations[name][1][i] = curr
			else curr = this.animations[name][1][i]
		}
	}

	/**
	 * Adds an animation composed of full frames.
	 * @param name Name of the animation
	 * @param timing How fast the frames should advance, expressed in frames (60fps) per animation frame. e.g. `timing = 5` means the animation will advance one frame every five game frames.
	 * @param frames A list of frames, in order.
	 */
	addKeyframes(name: string, timing: number, frames: any[], playOnce = false) {
		this.animations[name] = [timing, frames, playOnce]
	}

	loop() {
		// Break out of this if anything doesn't work.
		notMet: {
			if (!this.playing || !this.property || this.animations[this.playing][1].length == 0) break notMet
			// If we're playing and a property is defined, increase the current time by the frame's delta
			this.onTime += GL.delta

			if (this.onTime < this.animations[this.playing][0]) break notMet
			// If the animation's frame change timer has been reached, remove that frame's length.
			// This is done over setting to zero because it conserves the delta from previous frames.
			// This does bring some issues when the delta is really high, but this was resolved by adding a delta cap.
			this.onTime -= this.animations[this.playing][0]

			if (++this.onFrame < this.animations[this.playing][1].length) break notMet
			// If the frame goes over the amount of frames, reset it to zero.
			this.onFrame = 0

			if (!this.animations[this.playing][2]) break notMet
			// If the animation doesn't loop, stop playing it
			// this.onTime = 0, this.playing = undefined
			this.playing = undefined
		}

		// Update the property
		if (this.playing && this.property && this.animations[this.playing][1].length != 0)
			(<any>this.actingNode)[this.property] = this.animations[this.playing][1][this.onFrame]

		// Call `super.loop`
		super.loop()
	}
}
