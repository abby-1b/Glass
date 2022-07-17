import { GlassNode } from "./GlassNode";

export class Module {
	setup: (node: GlassNode) => void
	frame: (node: GlassNode, delta: number) => void
	takeData: (node: GlassNode, data: {[key: string]: any}) => void
}
