import { Glass, globalize } from "./Glass"

class EditorInstance {
	public render() {
		Glass.colorf(255, 255, 255)
		Glass.fillRect(2, 2, 255, 255)
		Glass.colorf(255, 0, 0)
		Glass.text("According to all known laws of aviation, there is no way a bee should be able to fly.", 3, 3)
	}
}
export const Editor = new EditorInstance()
globalize({Editor})
