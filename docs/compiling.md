To compile a project using the Glass library, you need to run the `build.py` file. It then prompts you which target you'd like to 'build' for. 

<sub>Node: 'build' is put between quotes because it doesn't _have_ to actually build something.<sub>

At the time of writing this, the current supported targets are `webLocal` and `webCompiler`. Both of them compile a project for the web and therefore borrow many elements from each other.

WebLocal is meant for testing a project in real time. It outputs its files through a local server that you can enter from your browser.

WebCompiled, on the other hand, compiles the project for the web, meaning you can drag-and-drop the folder it generates outside of this directory and it will still work.
