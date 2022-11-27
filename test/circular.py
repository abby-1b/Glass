## CodeIGuess (2022)

## Imagine a structure of nodes, each with dependencies.
# A > []
# B > [A, C]
# C > [A, B]

## Looping through these nodes depth-first would
## then result in an infinitely repeating loop.
# A
# B > A
#   > C > A
#       > B  <<< [B repeats here, so its dependencies repeat.]

## Since B repeats when searching depth-first, circular dependencies can be
## easily found by using a depth-first search.

from typing import List, Tuple, Set

# This is the same structure used by the build script, but with arbitrary names.
deps: List[Tuple[str, Set[str]]] = [
	("A", set([])), # No deps
	("B", set(["A", "C"])),
	("C", set(["A", "B"])), # Circular dep (C > B > C)

	("D", set(["E"])), # Circular dep (D > E > F > D)
	("E", set(["A", "F"])),
	("F", set(["D", "B"])),
]

# Detects circular dependencies, returning immediately when it finds one.
# Finding all circular dependencies is possible, but I can't be bothered with
# removing rotated dependencies from a whole set (a.k.a. detecting that B>C>B is
# the same as C>B>C). It *can* be done, but I don't want O(n!) complexity.
def detect_circular(deps: List[Tuple[str, Set[str]]]):
	dep_names = [a[0] for a in deps]

	def get_deps(d: str, l: List[str] = []):
		curr_deps = deps[dep_names.index(d)][1]
		for c in curr_deps:
			if c in l:
				print("Circular dependency found!")
				print(" > ".join(l[l.index(c)::]))
				exit()
			get_deps(c, l + [c])

	for d in deps:
		get_deps(d[0])

detect_circular(deps)