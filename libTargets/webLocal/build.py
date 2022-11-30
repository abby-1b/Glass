# Compile a project path
def compile(path: str):
	from os import system, remove

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

# Watch for file changes at a path
def watch(path: str):
	from time import sleep, time
	from os import listdir
	from os.path import getmtime

	print("Watching for changes to", path)
	while True:
		sleep(2)
		listdir(path)

		t = time()
		for f in listdir(path):
			m = getmtime(path + "/" + f)

			# Check if it was saved less than two seconds ago
			if t - m < 2:
				compile(path)
				break

# If it's not being ran as a module, start the watch process
if __name__ == "__main__":
	from sys import argv
	if len(argv) < 2:
		print("No project path provided!")
		exit()
	watch(argv[1])
