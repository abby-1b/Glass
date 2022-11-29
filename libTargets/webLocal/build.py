from os import system, remove #, rename

def compile(path: str):
	# Stores if everything went nicely.
	good = True

	# Make temporary ts config to include file 
	with open("./tempConfig.json", "w") as f:
		f.write('{"extends":"./tsconfig.json","include":["../../libOutputs/util.ts","src/**/*.ts","../../libOutputs/lib.ts","' + path + '/**/*.ts"]}')

	good = system("tsc --project tempConfig.json") == 0 # Run `tsc` with the temporary ts config
	remove("./tempConfig.json") # Remove the temporary config file

	with open("../../libOutputs/webLocal/index.html", "w") as f:
		f.write('<script src="./lib.js"></script><script>Local.projectOffset="' + path + '/"\nLoader.init()</script>')

	return good