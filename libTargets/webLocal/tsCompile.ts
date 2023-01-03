// NOTE: This is a Deno file, meant to by ran by Deno *ONLY*.
// That's why it has import statements.

// Import necessary functions
import { serve } from "https://deno.land/std@0.87.0/http/server.ts"
import { transform } from "https://deno.land/x/swc@0.2.1/mod.ts"

// Serve forever on port 1165 (referring to 116 and 115, unicode for 'ts')
const server = serve({ port: 1165 })
for await (const req of server) {
	if (!req.url.includes("?")) {
		// If the url syntax is incorrect, just return.
		req.respond({ status: 404 })
		continue
	}

	// Split parts and get the code to be compiled.
	const ps = req.url.split("?")
		, preCode = ps[0].slice(1) // `slice` takes off the leading '/' character.

	let isModule = false
	if (ps[1].includes("&")) {
		// If it's a special compilation, do that first.
		const act = ps[1].split("&")
		ps[1] = act[0]

		if (act[1] == "mod") isModule = true
	}

	// Compile!
	let { code } = transform(atob(preCode), {
		jsc: {
			target: "es2020",
			parser: {
				syntax: "typescript",
			},
			preserveAllComments: false
		},
		module: isModule ? {
			type: "amd",
			moduleId: ps[1].replace(/^[.\/]*|(\.\.\/)+[^.]*?\/|\..+?$/g, "") // Standardizes the path
		} : undefined,
		sourceMaps: "inline",
		inlineSourcesContent: false
	})

	// Extract the index of the base64 url
	let i = code.length - 5; while (code[i] != ",") i--; i++

	// Change the url from our code's base64 url to the given link
	const sMap = JSON.parse(atob(code.slice(i)))
	sMap.sources[0] = ps[1] + "?nc"

	// Update the source map
	code = code.slice(0, i) + btoa(JSON.stringify(sMap))

	// Return.
	req.respond({ body: code })
}
