#!/usr/bin/env python3

# Import necessary libraries
from typing import List, Tuple, Set
from os import listdir, chdir, getcwd, EX_SOFTWARE
from os.path import exists

err_col = "\033[91m"

# Compiles the library into a single file
def compile_lib(util_name: str = "util", lib_name: str = "lib"):
	originalDir = getcwd()
	chdir("../../")

	f = get_files("./src")
	f = sort_files(f)
	unreferenced, referenced = separate_unreferenced(f, "/Nodes/GlassNode.ts", True)
	with open("./libOutputs/" + util_name + ".ts", "w+") as o:
		o.write(compile(unreferenced))

	with open("./libOutputs/" + lib_name + ".ts", "w+") as o:
		o.write(compile(referenced))

	chdir(originalDir)

# Gets all the files in the main library (a.k.a. the `src` directory)
def get_files(path: str = "") -> List[str]:
	# List of files to return
	ret: List[str] = []

	# Loop through all files in the directory
	# for f in listdir("./src" + path):
	for f in listdir(path):
		if f.endswith(".ts"):
			# If they're typescript (or ts declaration) files, add them directly.
			ret += [path + "/" + f]
		elif "." in f:
			# If they're not typescript, but still have an extension, then throw an error.
			print(err_col + "File", path + "/" + f, "not recognized. Get help.")
			exit(1)
		else:
			# If they're a directory, loop through it and add its files to the list.
			ret += get_files(path + "/" + f)

	# Finally, return.
	return ret

# Pemoves the filename from a path
def remove_filename(fn: str) -> str:
	if fn.rindex(".") > fn.rindex("/"):
		# If the last dot in the filename is after the last slash we assume its a filename.
		# So just slice it until the last slash.
		return fn[0:fn.rindex("/") + 1]
	else:
		# Otherwise, return the value raw. It's perfect as-is.
		return fn

# Parses a path. Basically turns any instances of `../` in a path into their respective path.
# e.g. `dir/foo/../bar` -> `dir/bar`
# e.g. `./dir` -> `/dir`
import re
def parse_path(path: str) -> str:
	return re.sub(r"(\/|)\.\/", "/", re.sub(r'[a-zA-Z]*?\/\.\.\/', "", path))

# Detects circular dependencies
def detect_circular(deps: List[Tuple[str, Set[str]]]):
	# Store all dependency names
	dep_names = [a[0] for a in deps]

	# Loop through dependencies recursively
	def get_deps(d: str, l: List[str] = []):
		if not d in dep_names:
			print("Dependency not found:", d, deps)
		# Loop through current dependencies
		for c in deps[dep_names.index(d)][1]:
			# If the current dependency hasn't been previously imported, keep searching
			if not c in l:
				get_deps(c, l + [c])
				continue

			# A circular dependency has been found!
			# Warn the user
			print(err_col + "Circular dependency found!")
			nl = l[l.index(c)::]
			for k, i in zip(nl, range(len(nl))):
				print(" " + ("to" if i > 0 else "  "), err_col + k)

			# Exit
			exit()

	# Start recursion
	for d in deps:
		get_deps(d[0])

# Gets files that don't depend on a specific file.
def separate_unreferenced(deps: List[Tuple[str, Set[str]]], ref_name: str, ends: bool = False) -> Tuple[List[str], List[str]]:
	if ends:
		ref_name = [f for f in deps if f[0].endswith(ref_name)][0][0]
	unr: List[str] = [] # Holds unreferenced (by ref_name) nodes
	rfd: List[str] = [ref_name] # Holds referenced (by ref_name) nodes
	# Note: these are kept to speed up the search process. Nodes
	# that aren't in either list haven't been scanned at all.

	# Get names for easy processing
	names = [d[0] for d in deps]

	# Checks if a reference is 
	def check_ref(n: str) -> bool:
		cd = deps[names.index(n)]

		# If already processed, skip
		if cd[0] in rfd: return True
		elif cd[0] in unr: return False

		# Loop throgh its references
		for d in cd[1]:
			# If it has a reference to ref_name, add this to the referenced nodes
			if check_ref(d):
				rfd.append(cd[0])
				return True

		# If no references to ref_name are found, add it to the unreferenced nodes
		unr.append(cd[0])
		return False

	for d in deps:
		check_ref(d[0])

	# Sort dependencies by the order they were in previously.
	depNames = [d[0] for d in deps]
	unr.sort(key=lambda x: depNames.index(x))
	rfd.sort(key=lambda x: depNames.index(x))

	return (unr, rfd)

# Sorts files by the order they're needed in the combined file (using `/// <reference path="..." />` comments)
def sort_files(fs: List[str]) -> List[Tuple[str, Set[str]]]:
	# Get files and references
	file_ref: List[Tuple[str, Set[str]]] = []
	for fn in fs:
		with open(fn) as f:
			# Store references here
			refs: Set[str] = set()

			# Get the first line. If it starts with three slashes, add it to the references.
			# Repeat until a line that doesn't start with three slashes is found.
			ref = f.readline().strip()
			while ref.startswith("/// <reference"):
				ref = ref[ref.index("\"") + 1::]
				ref = ref[0:ref.index("\"")]
				refs.add(parse_path(remove_filename(fn) + ref))
				ref = f.readline().strip()
			file_ref.append((parse_path(fn), refs))

	# If there are any circular dependencies, just exit with an error.
	detect_circular(file_ref)

	# Sort by reference (bubble sort?)
	# While loops are used here because I'm used to TypeScript by now, and Python for loops are weird.
	changed = True
	iters = 0

	# Repeat until the list is sorted
	while changed:
		changed = False
		iters += 1
		i = 0

		# Go through each file
		while i < len(file_ref):
			# Look for its corresponding dependencies
			if len(file_ref[i][1]) == 0:
				i += 1
				continue
			fn = [p[0] for p in file_ref]

			# Get the dependency that is the farthest after this file
			m = max([fn.index(a) for a in file_ref[i][1]])

			# Swap this file with its farthest dependency
			if m > i:
				file_ref[i], file_ref[m] = file_ref[m], file_ref[i]
				changed = True
			i += 1

	# for f in file_ref: print(f)
	return file_ref

# Takes a list of file names sorted by dependency necessity and compiles them into a single `.ts`` file
def compile(f_names: List[str]):
	out_code: str = "/* This file was made by the `../build.py` script. */\n"

	# Loop through file names
	for f in f_names:
		# Skip if it's a declaration file!
		if f.endswith(".d.ts"): continue
		if not exists("." + f):
			print(f_names)
			print(err_col + "File not found:", "." + f)
			exit(1)
		with open("." + f, "r") as f:
			curr_out = f.read()

			# If they have references to other files, remove these comments. They confuse `tsc` at compile time.
			while curr_out.startswith("///"):
				curr_out = curr_out[curr_out.index("\n")::]
			out_code += curr_out + "\n"
	return out_code

# Gets the wanted compilation target from the user
def get_target():
	d = "./libTargets"
	targets = [a for a in listdir(d) if a[0] != "_" and not "." in a]

	if len(targets) == 0:
		print(err_col + "No targets available!")
		exit()
	elif len(targets) == 1:
		return d + "/" + targets[0]
	else:
		for t, i in zip(targets, range(len(targets))):
			print(" [" + str(i) + "]", t)
		
		i = input(" [?] ")
		return d + "/" + targets[int(i)]

if __name__ == "__main__":
	# Get the wanted target
	t = get_target()
	build_file_name = "build"
	build_file = t + "/" + build_file_name + ".py"

	# Check if it has a build file
	if not exists(build_file):
		print(err_col + "ERROR:", build_file_name, "not found in", t)
		exit()

	# Run the target's build script
	import sys
	sys.path.append("../")
	chdir(t)
	t = t[2::].split("/")

	# Get target module
	md = getattr(__import__(".".join(t) + "." + build_file_name), t[1]).build
	if not ("compile" in dir(md)):
		print(err_col + "compile function not found in " + build_file)
		exit(EX_SOFTWARE)

	# Pass the library compilation function to the project, basically letting it compile if it wants to.
	if md.compile("../../projects/test", compile_lib): # Keep in mind this path is relative to the changed directory.
		print("Done.")
	else:
		print(err_col + "Error")
		exit(EX_SOFTWARE)
