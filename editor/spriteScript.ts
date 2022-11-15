
export function loop(this: Sprite) {
	if (Input.keys.includes("d"))
		((this.children[0] as AnimationNode).play("run"))
	else 
		((this.children[0] as AnimationNode).play("ball"))
}
