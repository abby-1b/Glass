
let rs = [
	document.getElementsByClassName("fileResizer")[0],
	document.getElementsByClassName("propertyResizer")[0],
	document.getElementsByClassName("terminalResizer")[0]
]

let element = document.getElementsByClassName("fileView")[0]

function resizeGrid() {
	document.body.style.gridTemplateColumns = `calc(26vw + ${rs[0].holdPos}px) var(--borderSize) calc(53vw - ${rs[0].holdPos}px + ${rs[1].holdPos}px) var(--borderSize) calc(20vw + (1vw - var(--borderSize) * 2) - ${rs[1].holdPos}px)`
	document.body.style.gridTemplateRows = `calc(55vh + ${rs[2].holdPos}px) var(--borderSize) calc(45vh - var(--borderSize) - ${rs[2].holdPos}px)`
}

for (let r = 0; r < rs.length; r++) {
	rs[r].holdPos = 0
	rs[r].onpointerup = (e) => { document.onpointermove = undefined }
}
rs[0].onpointerdown = (e) => { document.onpointermove = (e) => { rs[0].holdPos -= rs[0].getBoundingClientRect().x - e.clientX; resizeGrid() } }
rs[1].onpointerdown = (e) => { document.onpointermove = (e) => { rs[1].holdPos -= rs[1].getBoundingClientRect().x - e.clientX; resizeGrid() } }
rs[2].onpointerdown = (e) => { document.onpointermove = (e) => { rs[2].holdPos -= rs[2].getBoundingClientRect().y - e.clientY; resizeGrid() } }

const preventDefault = (e) => { e.preventDefault() }
var supportsPassive = false
try { window.addEventListener("test", null, Object.defineProperty({}, 'passive', { get: function () { supportsPassive = true } })) } catch(e) {}
window.addEventListener('DOMMouseScroll', preventDefault, false)
window.addEventListener('onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel', preventDefault, supportsPassive ? { passive: false } : false)
window.addEventListener('touchmove', preventDefault, supportsPassive ? { passive: false } : false)
