function setNormal(...nums: number[]) {
	let arr = new Float32Array(8)
	arr[0] = nums[0] / nums[1]
	arr[1] = nums[1] / nums[2]
	arr[2] = nums[0] / nums[1] + nums[2]
	arr[3] = nums[1] / nums[2]
	arr[4] = nums[0] / nums[1]
	arr[5] = nums[1] / nums[2] + nums[3]
	arr[6] = nums[0] / nums[1] + nums[2]
	arr[7] = nums[1] / nums[2] + nums[3]
}

function setCopy(...nums: number[]) {
	let arr = new Float32Array(8)
	arr[0] = nums[0] / nums[1]
	arr[1] = nums[1] / nums[2]
	arr[2] = arr[0] + nums[2]
	arr[3] = arr[1]
	arr[4] = arr[0]
	arr[5] = arr[1] + nums[3]
	arr[6] = arr[0] + nums[2]
	arr[7] = arr[1] + nums[3]
}

function setCopy2(...nums: number[]) {
	let arr = new Float32Array(8)
	arr[0] = nums[0] / nums[1]
	arr[1] = nums[1] / nums[2]
	arr[2] = arr[0] + nums[2]
	arr[3] = arr[1]
	arr[4] = arr[0]
	arr[5] = arr[1] + nums[3]
	arr[6] = arr[2]
	arr[7] = arr[5]
}

function setSameTime(...nums: number[]) {
	let arr = new Float32Array(8)
	arr[0] = arr[4] = nums[0] / nums[1]
	arr[1] = arr[3] = nums[1] / nums[2]
	arr[2] = arr[6] = nums[0] / nums[1] + nums[2]
	arr[5] = arr[7] = nums[1] / nums[2] + nums[3]
}
function setSameTime2(...nums: number[]) {
	let arr = new Float32Array(8)
	arr[0] = arr[4] = nums[0] / nums[1]
	arr[1] = arr[3] = nums[1] / nums[2]
	arr[2] = arr[6] = arr[0] + nums[2]
	arr[5] = arr[7] = arr[1] + nums[3]
}

function setCopyVar(...nums: number[]) {
	let arr = new Float32Array(8)
	const a = nums[0] / nums[1]
		, b = nums[1] / nums[2]
		, c = a + nums[2]
		, d = b + nums[3]
	arr[0] = a
	arr[1] = b
	arr[2] = c
	arr[3] = b
	arr[4] = a
	arr[5] = d
	arr[6] = c
	arr[7] = d
}

const reps = 5000000
const nums: number[][] = []
for (let i = 0; i < 10; i++) {
	const s: number[] = new Array(4).fill(0).map(e => Math.random())
	nums.push(s)
}
console.log(nums)

function time(fn: Function) {
	const t = performance.now()
	for (let i = 0; i < reps; i++) fn(nums[i % 10])
	return performance.now() - t
}

console.log("setNormal", time(setNormal))
console.log("setCopy", time(setCopy))
console.log("setCopy2", time(setCopy2))
console.log("setSameTime", time(setSameTime))
console.log("setSameTime2", time(setSameTime2))
console.log("setCopyVar", time(setCopyVar))
