from typing import Callable

# Compile a project path
def compile(path: str, compLib: Callable[[], None]):
	compLib()

	from os import system, remove
	from os.path import exists
	from shutil import copytree, rmtree, ignore_patterns, copyfile

	# Remove export path if it exists
	if exists("../../libOutputs/webCompiled"): rmtree("../../libOutputs/webCompiled")

	# Move project files to output folder (not including `.ts` files)
	copytree(path, "../../libOutputs/webCompiled", ignore=ignore_patterns("*.ts"))

	# Add necessary dependencies
	copyfile("../_dependencies/font.png", "../../libOutputs/webCompiled/font.png") # Font image

	# Make temporary ts config to include file 
	with open("./tempConfig.json", "w") as f:
		f.write('{"extends":"./tsconfig.json","include":["../../libOutputs/util.ts","../_web/src/**/*.ts","../../libOutputs/lib.ts","' + path + '/**/*.ts"]}')

	good = system("tsc --project tempConfig.json") == 0 # Run `tsc` with the temporary ts config
	remove("./tempConfig.json") # Remove the temporary config file

	# Make index.html
	with open("../../libOutputs/webCompiled/index.html", "w") as f:
		f.write('<script src="./lib.js"></script>')

	return good

# Watch for file changes at a path
def watch(path: str):
	poll_rate = 1

	from time import sleep, time
	from os import listdir
	from os.path import getmtime

	print("Watching for changes to", path)
	while True:
		sleep(poll_rate)
		listdir(path)

		for f in listdir(path):
			m = getmtime(path + "/" + f)

			# Check if it was saved less than `poll_rate` ago
			# `time` is called repeatedly in case `getmtime` takes too long to execute.
			if time() - m < poll_rate:
				print("Changes found.")
				compile(path, lambda: None)
				break

# If it's not being ran as a module, start the watch process
if __name__ == "__main__":
	from sys import argv
	if len(argv) < 2:
		print("No project path provided!")
		exit()
	watch(argv[1])
