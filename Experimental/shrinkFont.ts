
import { decode, encode } from "https://deno.land/x/pngs/mod.ts"

const file = decode(await Deno.readFile("font.png"))
const dat = [...file.image.filter((_, i) => i % 4 == 3)].map(e => e != 0 ? 1 : 0)

function getPos(x: number, y: number) {
	return dat[x + y * file.width]
}
let onCol = 0
function readCol(): number {
	const ret = 0
		| getPos(onCol, 0)
		| (getPos(onCol, 1) << 1)
		| (getPos(onCol, 2) << 2)
		| (getPos(onCol, 3) << 3)
	onCol++
	return ret
}

const nums: number[] = []
while (onCol < file.width) {
	nums.push((readCol() << 4) | readCol())
	if (nums.length % 4 == 3) nums.push(255)
	nums.push((readCol() << 4) | readCol())
	if (nums.length % 4 == 3) nums.push(255)
	onCol++
}
while (nums.length % 4 != 0) nums.push(nums.length % 4 == 0 ? 255 : 0)
console.log(nums.length)
console.log(nums)

let width = Math.ceil(Math.sqrt(nums.length / 4))
let height = width + 0
while (width * (height - 1) * 4 > nums.length) height--
while ((width - 1) * height * 4 > nums.length) width--
console.log(width, height)
console.log(width * height * 4)

const expect = width * height * 4
while (nums.length < expect) nums.push(0)

const outImg = encode(new Uint8Array(nums), width, height)
await Deno.writeFile("out.png", outImg)
