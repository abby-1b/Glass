
from subprocess import getoutput as run
from base64 import b64encode

def escape(string: str) -> str:
	return string \
		.replace("\\", "\\\\") \
		.replace("\n", "\\n") \
		.replace("\t", "\\t") \
		.replace("\"", "\\\"")

def transpile(code: str, path: str):
	c = b64encode(code.encode("ascii"))
	c = c.decode("ascii")
	return run("echo \"" + escape("import{emit}from\"https://deno.land/x/emit@0.0.1/mod.ts\";let url=\"data:text/typescript;base64," + c + "\";let code=(await emit(url))[url];let i=code.length-5;while(code[i]!=',')i--;i++;const sMap=JSON.parse(atob(code.slice(i)));sMap.sources[0]=\"" + path + "\";console.log(code.slice(0,i)+btoa(JSON.stringify(sMap)))") + "\" | deno run -A -")
	
a = transpile("""
const a: string = "Hey there!"
console.log(a)
""", "./nonelmao")

print(a)
