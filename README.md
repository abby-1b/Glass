![Banner](banner.png)

# Glass
Glass is a pixel art game engine built on TypeScript and Node.JS

## Modularity
When you load a Unity web build, it takes a few seconds to load up and start the game. This happens because Unity is a big engine, with lots of useful features that sometimes go unused.

This engine is built entirely out of modules, so it leaves unused code out of the final build.

## Ease of use
You can do a lot in just a few lines of TS. 

## Fast development
[...]

## Made for game jams.
It was developed for the first game jam I joined, and has kept growing since then with each game I’ve made (or tried making).

# Why TypeScript?
I love JavaScript. It's dynamic, allows me to do things quickly and efficiently with great scalability (at least in the scope that I've worked in). The thing is, it's not the best in terms of code completion or modularity.

So when I first used TypeScript, I immediately fell in love. It has type checking, it lets me switch over slowly from JavaScript.

The only thing I _don't_ like about TypeScript is the fact that it has to get compiled to JavaScript after every change, which isn't practical due to my workflow. To get around this, I've implemented a custom server for testing that automatically compiles TS to JS when any TS file is requested. I just need to include any `.ts` file in the HTML file and it automatically gets compiled to `.js`.

# Why another game engine?
[...]

# Planned features
 - (Finishing the project)
 - Pruning unused functions
 - Building to WebAssembly (compiling TypeScript to WebAssemblyScript)
	 - This is easier said than done, though I have an idea for how to make it work.
	 - First, we need to separate the DOM manipulation parts of the engine from the actual computation.
	 - Then, converting the computation part of the TypeScript files (a language that allows dynamic typing) to a fully statically typed language like C.
	 - Then, somehow, making bindings that let the computation parts talk to the DOM manipulation parts.
	 - It's just a big hassle to make work in general.
