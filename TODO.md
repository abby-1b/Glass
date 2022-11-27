Tasks:
	[x] Define class structure
	[x] Load scenes
		[x] Make `Loader` class
		[x] Save scenes as special files (based on the Serialization class)
			[x] Find a way to track the important properties of a node
			[x] Save what's important of each node
		[x] Re-make `Loader` class to fit special format
	[ ] Rendering
		[x] Shapes
		[x] Load textures
		[x] Display textures
		[x] Shape rotation
		[x] Texture rotation
		[ ] Camera
	[x] General save/load (unlike JSON, this allows for cyclic or self-referencing objects)
		[x] Turn a node into a list of object along with a JSON-like object organizing these objects in a tree structure.
		[x] Turn a string of the saved file into the original object it came from
	[x] Extra nodes
		[x] Animation node (takes a node + a property and animates it over time)
		[x] Timer node (fires a signal after a certain amount of time)
	[x] Signals! (Godot-like)
	[x] Fix compilation system re-work
		[x] Library compilation
			[x] Read all files in `src`
			[x] Sort them by the order they're needed (using the top "/// <reference>")
			[x] Find any circular dependencies
			[x] Separate main library from utilities
			[x] Combine all of them and put them in `libOutputs/lib.ts`
		[x] Target compilation
			[x] Start a small cli tool
			[x] When compiling, this will ask what target to compile to
			[x] Each target has its own build system. This is identified as `target/build.py`
			[x] Run the target's build system
		[x] Make web build (previously the only option)
	[x] Script-loading
		[x] The scripts must load before the scene is loaded to avoid needing a class from these scripts during deserialisation.
	[ ] UI
		[x] Button
			[x] Display
			[x] Emit signals when clicked
		[ ] Text display
		[ ] Generic container (like a div)
	[x] Pause system
		[x] Separate draw from process
		[x] Actually pause
		[x] Un-pause
	[ ] A node editing system (in editor, not main library!)
		[ ] Create nodes
		[ ] Change properties
		[ ] Save using save system
	[ ] Random generation (perlin noise, anything really.)
		[ ] Generate smooth noise
		[ ] Put noise into texture
