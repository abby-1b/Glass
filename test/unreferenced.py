
## (The target library refers to the part of the library that is separate for
## each different compilation target. The main library refers to every node, or
## content general content that requires the target library to function.)
## Some files are needed by the target library but don't *themselves* need these target library functions.

## In this example, assume B is a main library function and can't be separated out.
# A <<< [A is not dependant on B, so it can be separated.]
# B > A
# C > B > A
#   > A
# D > F > A <<< [D is not dependant on B either]
#   > A
# E > B > A
#   > A
# F > A <<< [F is not dependant on B either]

from typing import List, Tuple, Set

# This is the same structure used by the build script, but with arbitrary names.
deps: List[Tuple[str, Set[str]]] = [
	("A", set([])),
	("B", set(["A"])),
	("C", set(["B", "A"])),

	("D", set(["F", "A"])),
	("E", set(["B", "A"])),
	("F", set(["A"])),
]

def get_unreferenced(deps: List[Tuple[str, Set[str]]], ref_name: str):
	unr: Set[str] = set() # Holds unreferenced (by ref_name) nodes
	rfd: Set[str] = set([ref_name]) # Holds referenced (by ref_name) nodes
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
				rfd.add(cd[0])
				return True

		# If no references to ref_name are found, add it to the unreferenced nodes
		unr.add(cd[0])
		return False

	for d in deps:
		check_ref(d[0])

	return unr

print(get_unreferenced(deps, "B"))

