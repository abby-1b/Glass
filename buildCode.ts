
export const fns: {[key: string]: {modify: (code: string) => string, build: (fileName: string, outName: string) => Promise<number>}} = {
	"bin": {
		modify: (code: string): string => {
			return code
		},
		build: async (fileName: string, outName: string): Promise<number> => {
			const ret = await Deno.run({cmd: ["rustc", fileName, "-o", outName]}).status()
			return ret.code
		}
	}
}