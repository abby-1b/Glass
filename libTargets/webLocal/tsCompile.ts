// NOTE: This is a Deno file, meant to by ran by Deno *ONLY*.
// That's why it has import statements.

// Import necessary functions
import { serve } from "https://deno.land/std@0.87.0/http/server.ts"
import { emit } from "https://deno.land/x/emit@0.12.0/mod.ts"

// Serve forever on port 1165 (referring to 116 and 115, unicode for 'ts')
for await (const req of serve({ port: 1165 })) {
	if (!req.url.includes("?")) {
		// If the url syntax is incorrect, just return.
		req.respond({ status: 404 })
		continue
	}

	// Split parts and get the code to be compiled.
	const ps = req.url.split("?")
		, url = "data:text/typescript;base64," + ps[0].slice(1) // `slice` takes off the leading '/' character.

	// Compile!
	const code = (await emit(new URL(url)))[url]

	// Extract the index of the base64 url
	let i = code.length - 5; while (code[i] != ",") i--; i++

	// Change the url from our code's base64 url to the given link
	const sMap = JSON.parse(atob(code.slice(i)))
	sMap.sources[0] = ps[1]

	// Return.
	req.respond({ body: code.slice(0, i) + btoa(JSON.stringify(sMap)) })
}
