
class FileView {

	public static element: HTMLElement = document.getElementById("fileView") as HTMLElement
	public static input: HTMLInputElement = (this.element.children[0] as HTMLInputElement)

	public static getFiles(): void {
		fetch(this.input.value + "/.FILES").then(r => r.text().then(t => {
			if (t == "") {
				this.input.style.border = "1px solid red"
				return
			} else {
				this.input.style.border = "1px solid #2d2b55"
			}
			this.element.children[2].innerHTML = t.split(",").map(e => `<div class='file' onclick='FileView.clickFile(this)'><div class='fileIcon nosmooth ft${e.split(":")[0]}'></div><div style='overflow:hidden'>` + e.split("/").slice(-1)[0] + "</div></div>").join("")
		}))
	}

	public static clickFile(f: HTMLElement): void {
		if (f.children[0].classList.contains("ftDIR")) {
			(this.element.children[0] as HTMLInputElement).value += "/" + f.innerText
			this.getFiles()
		} else {
			console.log("Open file:", f.innerText)
		}
	}

	static {
		this.input.value = window.location.pathname.includes(".") ? window.location.pathname.split("/").slice(0, -1).join("/") : window.location.pathname
		this.input.addEventListener("keydown", e => {
			if (e.key == "Enter") {
				this.getFiles()
			}
		})

		this.element.children[1].addEventListener("click", () => {
			this.input.value = this.input.value.split("/").slice(0, -1).join("/")
			this.getFiles()
		})

		this.input.value += "/Assets"
		this.getFiles()
	}
}