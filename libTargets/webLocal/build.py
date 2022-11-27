from os import system, remove, rename #, listdir

def compile(path: str):
	# Make temporary ts config to include file 
	with open("./tempConfig.json", "w") as f:
		f.write('{"extends":"./tsconfig.json","include":["../../libOutputs/util.ts","src/**/*.ts","../../libOutputs/lib.ts","' + path + '/**/*.ts"]}')

	system("tsc --project tempConfig.json") # Run `tsc` with the temporary ts config
	remove("./tempConfig.json") # Remove the temporary config file

	# exit()
	rename("./lib.js", "../../libOutputs/webLocal/lib.js")

	with open("../../libOutputs/webLocal/index.html", "w") as f:
		f.write('<script src="./lib.js"></script><script>Loader.init()</script>')