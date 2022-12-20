import { serve } from "https://deno.land/std@0.87.0/http/server.ts"
import { emit } from "https://deno.land/x/emit@0.0.1/mod.ts"

for await (const req of serve({ port: 1165 })) {
	if (!req.url.includes("?")) {
		req.respond({ status: 404 })
		continue
	}
	const ps = req.url.split("?")
		, url = "data:text/typescript;base64," + ps[0].slice(1)

	const code = (await emit(url))[url]

	let i = code.length - 5; while (code[i] != ",") i--; i++

	const sMap = JSON.parse(atob(code.slice(i)))
	sMap.sources[0] = ps[1]

	req.respond({ body: code.slice(0, i) + btoa(JSON.stringify(sMap)) })
}
