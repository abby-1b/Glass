import { Vec2 } from "./Math"

export class GlassNode {
	static id = 0
	static allNodes: (GlassNode | undefined)[] = []
	static removeNode(id: number) {
		GlassNode.allNodes[id] = undefined
	}

	id: number
	pos: Vec2 = new Vec2(0, 0)
	size: Vec2 = new Vec2(0, 0)

	children: GlassNode[] = []

	constructor() {
		this.id = GlassNode.id++
		GlassNode.allNodes.push(this)
	}

	public has(...nodes: GlassNode[]) {
		this.children.push(...nodes)
	}

	public render() {
		for (let c = 0; c < this.children.length; c++)
			this.children[c].render()
	}
}
