
class Local {
	static projectOffset = ""

	static async getText(path: string): Promise<string> {
		return fetch(this.projectOffset + path).then(r => {
			if (r.ok == false) throw r
			return r.text()
		})
	}

	static async writeText(path: string, txt: string, reason?: string): Promise<void> {
		return new Promise((resolve, reject) =>
			fetch(this.projectOffset + path, {
				method: "POST",
				body: JSON.stringify(reason ? { txt, reason } : { txt })
			})
				.then(_ => resolve())
				.catch(_ => reject())
		)
	}

	/**
	 * Loads a module into the module system.
	 * NOTE: Remember to pass module names without an extension!
	 * @param path The path to the module (with no `.ts` nor `.js` extension)
	 * @returns 
	 */
	static async loadModule(path: string) {
		return fetch(this.projectOffset + path + ".ts?mod").then(r => {
			if (r.ok == false) throw r
			return r.text()
		}).then(t => {
			const ret = (1, eval)(t)
			console.log("Loaded:", path)
			return ret
		})
	}
}
