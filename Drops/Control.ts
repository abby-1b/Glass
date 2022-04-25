
let mouseX = 0
let mouseY = 0
let mouseDown = false

window.addEventListener("mousemove", (e) => {
	mouseX = e.clientX
	mouseY = e.clientY
})

window.addEventListener("mousedown", (e) => {
	mouseDown = true
})

window.addEventListener("mouseup", (e) => {
	mouseDown = false
})
