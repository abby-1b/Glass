/** GlassNode. The base class for any object in a scene. */
class GlassNode {
	name: string
	parent: GlassNode
	children: GlassNode[] = []
	shown = true

	constructor(name: string) {
		this.name = name
		// if (name[0] != "@") root.addChild(this)
	}
	
	addChild(newChild: GlassNode): this {
		newChild.parent = this
		this.children.push(newChild)
		return this
	}

	addChildren(newChildren: GlassNode[]): this {
		newChildren.forEach(c => c.parent = this)
		this.children.push(...newChildren)
		return this
	}

	frameFn(): void {
		this.children.forEach(c => c.frameFn())
	}
}

const root = new GlassNode("@root")