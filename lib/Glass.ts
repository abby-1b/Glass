
class Glass {
	public static init() {
		console.log("Initting...")
		if ("frame" in window) {
			console.log(window["frame"])
		}
	}
}

var exports = {
	Glass
}
