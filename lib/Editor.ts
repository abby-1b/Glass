import { Glass, globalize } from "./Glass"
import { GlassNode } from "./GlassNode"

class EditorInstance {
	text = ""

	openPaths = ["Root"]
	selected = ""

	init() {
		// Reloads all scripts
		window.addEventListener("keydown", (k) => {
			if (k.key == "p" && (k.metaKey || k.ctrlKey))
				Glass.scene.children.forEach(c => { this.reloadScript(c) })
		})
	}

	protected reloadScript(node: GlassNode) {
		if (node.scriptSrc !== undefined) {
			import(Glass.mainPath + "/" + node.scriptSrc + "?" + Math.random()).then(i => {
				if ("setup" in i) node.setupFn = i.setup
				if ("frame" in i) node.frameFn = i.frame
			}).catch(err => {
				console.log("Error reloading script:\n", err)
			})
		}
		node.children.forEach(c => { this.reloadScript(c) })
	}

	// protected renderNode(n: GlassNode, indent = 0, vertical = 0, level = 0, path = ""): number {
	// 	if (Glass.frameCount < 1) console.log(path)
	// 	const open = this.openPaths.includes(path)
	// 	const txt = (open ? "" : ">") + n.getName(true)

	// 	if (this.selected == path) {
	// 		Glass.colorf(0, 0, 0, 80)
	// 		Glass.fillRect(indent * 10 - 1, vertical * 10 - 1, txt.length * 10, 10)
	// 	}
	// 	Glass.colorf(0, 0, 0)
	// 	Glass.text(txt, indent * 10, vertical * 10)
	// 	if (!open) return 0
	// 	let added = 0
	// 	n.children.forEach(c => {
	// 		added++
	// 		added += this.renderNode(c, indent + 1, vertical + added, level + 1, path + "/" + c.getName(true))
	// 	})
	// 	return added
	// }

	// public render() {
	// 	Glass.translate(2, 2)
	// 	this.text += Glass.events.join("")
	// 	Glass.colorf(255, 255, 255)
	// 	Glass.fillRect(0, 0, 255, 255)

	// 	Glass.colorf(0, 0, 0)
	// 	Glass.translate(2, 2)
	// 	this.renderNode(Glass.scene, 0, 0, 0, "Root")
	// 	Glass.translate(-2, -2)

	// 	Glass.translate(-3, -3)
	// }
}
export const Editor = new EditorInstance()
globalize({Editor})
