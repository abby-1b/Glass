class HTML {
	/**
	 * Sets up a surface for an HTML environment.
	 * @param desiredSize The desired size of the drawing surface or screen.
	 * @returns A drawable surface.
	 */
	public static setup() {
		const metaTags: { [key: string]: string } = {
			"viewport": "width=device-width,initial-scale=1,maximum-scale=1.0,user-scalable=0",
			"apple-mobile-web-app-capable": "yes"
		}
		for (const mt in metaTags) {
			const meta: HTMLMetaElement = document.createElement("meta")
			meta.name = mt
			meta.content = metaTags[mt]
			document.head.appendChild(meta)
		}
		document.body.style.margin = document.body.style.padding = "0"

		// Checks if the user interacted with the page
		document.body.innerHTML = "<h1 id='play'style='font-family:monospace;position:fixed;z-index:0;transform:translate(-50%,-50%);top:50%;left:50%;transition:opacity .5s'>[Play]</h1>"
		window.addEventListener("click", () => {
			Surface.ready = true
		})

		let el: HTMLCanvasElement
		if (Surface.texture instanceof TextureWebGL && Surface.texture.secondStepBlur) {
			el = document.body.appendChild(Surface.texture.secondStepCanvas)
		} else {
			el = document.body.appendChild(Surface.texture.el)
		}
		el.style.width = "100vw"
		el.style.height = "100vh"
	}

	public static fullScreen(el: HTMLCanvasElement) {
		el.requestFullscreen()
	}

	public static exitFullscreen() {
		document.exitFullscreen()
	}

	public static isFullscreen() {
		return !!document.fullscreenElement
	}
}