import { Glass } from "../../lib/Glass";

type Pos2d = [number, number]
type Pos3d = [number, number, number]

type Block = string
type Chunk = [Block, Block, Block, Block, Block, Block, Block, Block, Block]
const loaded: {[key: string]: Chunk} = {} // key: x,y,z (in hexadecimal), value: chunk data

const drawBufferA: Pos3d = [0, 0, 0]
const drawBufferB: Pos3d = [0, 0, 0]
const blockSize = 30

export function setup() {}

export function frame() {
	Glass.colorf(255, 0, 0)
	Glass.translate(Glass.width / 2, Glass.height / 2)
	// Glass.line(0, 0, Glass.mouseX, Glass.mouseY) 
	drawBlock("stone", [0, 0, 1])
}

// Math functions
function wToScr(x: number, y: number, z: number): Pos2d {
	return [x / z * blockSize, y / z * blockSize]
}

function rotY(x: number, y: number, z: number, a: number): Pos3d {
	const s = Math.sin(a)
		, c = Math.cos(a)
	
	return [
		x * c - z * s,
		y,
		x * s + z * c
	]
}

// Drawing functions
function drawBlock(b: Block, pos: Pos3d) {
	drawBufferA[0] = pos[0] + 1
	drawBufferA[1] = pos[1]
	drawBufferA[2] = pos[2]
	drawBufferB[0] = pos[0] + 1
	drawBufferB[1] = pos[1] + 1
	drawBufferB[2] = pos[2]
	Glass.line(...wToScr(...pos), ...wToScr(...drawBufferA))
	Glass.line(...wToScr(...drawBufferA), ...wToScr(...drawBufferB))
	drawBufferA[0] = pos[0]
	drawBufferA[1] = pos[1] + 1
	drawBufferA[2] = pos[2]
	Glass.line(...wToScr(...drawBufferA), ...wToScr(...drawBufferB))
	Glass.line(...wToScr(...drawBufferA), ...wToScr(...pos))
	
	drawBufferA[0] = pos[0]
	drawBufferA[1] = pos[1]
	drawBufferA[2] = pos[2] + 1
	Glass.line(...wToScr(...drawBufferA), ...wToScr(...pos))
	drawBufferB[0] = pos[0] + 1
	drawBufferB[1] = pos[1]
	drawBufferB[2] = pos[2] + 1
	Glass.line(...wToScr(...drawBufferA), ...wToScr(...drawBufferB))
	drawBufferA[0] = pos[0] + 1
	drawBufferA[1] = pos[1] + 1
	drawBufferA[2] = pos[2] + 1
	Glass.line(...wToScr(...drawBufferA), ...wToScr(...drawBufferB))
}
