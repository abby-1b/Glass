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
		[ ] Timer node (fires a signal after a certain amount of time)
	[x] Signals! (Godot-like)
	[ ] Script-loading
		[ ] The scripts must load before the scene is loaded to avoid needing a class from these scripts during deserialisation.
	[ ] UI
		[ ] Button
			[x] Display
			[ ] Emit signals when clicked
		[ ] Text display
		[ ] Generic container
	[ ] Pause system
		[x] Separate draw from process
		[ ] Actually pause
		[ ] Un-pause
	[ ] Random generation (perlin noise, anything really.)
		[ ] Generate smooth noise
		[ ] Put noise into texture
