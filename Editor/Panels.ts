
const switchers = [...document.getElementsByClassName("panels")]
switchers.forEach(e => {
	const div = e as HTMLDivElement
	const panels = div.innerText.split(" ")

	div.innerHTML = ""

	const panelSwitcher = document.createElement("div")
	panelSwitcher.className = "panelSwitcher"
	div.appendChild(panelSwitcher)

	const panelHolder = document.createElement("div")
	panelHolder.className = "panelHolder"
	div.appendChild(panelHolder)

	panels.forEach(pName => {
		const p = document.createElement("div")
		p.className = "panelSwitcherOption"
		p.id = pName
		p.innerText = pName
		panelSwitcher.appendChild(p)
	})

	// div.innerHTML = panels.map(p => `<div class='panelSwitcherOption'>${p}</div>`).join("")
	// div.outerHTML += "<br>"
})
