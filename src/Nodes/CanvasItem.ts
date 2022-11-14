/// <reference path="GlassNode.ts" />

/**
 * A node that draws to the canvas.
 */
class CanvasItem extends GlassNode {
	visible = true
	pos: Vec2 = new Vec2(0, 0)

	/** Size to multiply the item with. Separate from size. */
	scale: Vec2 = new Vec2(1, 1)
	color: [number, number, number, number] = [0, 0, 0, 1]

	/**
	 * Sets the item's color.
	 * @param r Amount of red as a floating point value from 0 to 1
	 * @param g Amount of green as a floating point value from 0 to 1
	 * @param b Amount of blue as a floating point value from 0 to 1
	 * @param a Alpha value as a floating point value from 0 to 1
	 */
	setColor(r: number, g: number, b: number, a: number = 1) {
		this.color[0] = r, this.color[1] = g
		this.color[2] = b, this.color[3] = a
	}
}
