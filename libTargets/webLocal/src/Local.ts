
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
}
