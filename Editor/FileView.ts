
class FileView {

	static element: HTMLElement = document.getElementsByClassName("fileView")[0] as HTMLElement
	static input: HTMLInputElement = (FileView.element.children[0] as HTMLInputElement)

	static getFiles() {
		fetch(FileView.input.value + "/.FILES").then(r => r.text().then(t => {
			if (t == '') {
				FileView.input.style.border = '1px solid red'
				return
			} else {
				FileView.input.style.border = '1px solid #2d2b55'
			}
			FileView.element.children[2].innerHTML = t.split(',').map(e => `<div class='file' onclick='FileView.clickFile(this)'><div class='fileIcon nosmooth ft${e.split(":")[0]}'></div><div style='overflow:hidden'>` + e.split("/").slice(-1)[0] + "</div></div>").join('')
		}))
	}

	static clickFile(f: HTMLElement) {
		if (f.children[0].classList.contains("ftDIR")) {
			(FileView.element.children[0] as HTMLInputElement).value += '/' + f.innerText
		} else {
			// openFile
		}
		FileView.getFiles()
	}

	static {
		FileView.input.value = window.location.pathname.includes('.') ? window.location.pathname.split("/").slice(0, -1).join('/') : window.location.pathname
		FileView.input.addEventListener('keydown', e => {
			if (e.key == "Enter") {
				FileView.getFiles()
			}
		})

		FileView.element.children[1].addEventListener('click', e => {
			FileView.input.value = FileView.input.value.split("/").slice(0, -1).join("/")
			FileView.getFiles()
		})

		FileView.input.value += "/Assets"
		FileView.getFiles()
	}
}