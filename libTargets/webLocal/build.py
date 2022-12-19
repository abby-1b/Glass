from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, HTTPServer
from typing import List, Any, Callable, Dict

from subprocess import getoutput as run
from base64 import b64encode
from io import BytesIO
from http import HTTPStatus
import sys
FILE_SYSTEM_ENCODING: str = sys.getfilesystemencoding()

from math import floor

from os import chdir, getcwd, listdir
from os.path import getmtime

from time import time

import urllib

# Import build
if True:
	originalDir = getcwd()
	chdir("../../")
	from build import get_files, sort_files, separate_unreferenced
	chdir(originalDir)

# Implement a server
# Make the server compile .ts to .js (regex? maybe?) with source maps
# Send compiled files (with generated source maps) to client

# Escape a string (used for transpilation)
def escape(string: str) -> str:
	return string \
		.replace("\\", "\\\\") \
		.replace("\n", "\\n") \
		.replace("\t", "\\t") \
		.replace("\"", "\\\"")

# Cache transpiled files in the disk.
CACHE_PATH = "../../libTargets/webLocal/cache/"
cache: Dict[str, float] = {} # {file_name: last_modified, ...}
for f in listdir(CACHE_PATH):
	p = f.split("|")
	cache[p[1]] = int(p[0])

def transform_path(path: str):
	return path.replace("|", "@").replace("/", "@")

# Transpile TS to JS
def transpile(file_path: str, link_path: str):
	# Transform path into a single-directory safe name
	trans_path = transform_path(link_path)

	if trans_path in cache and abs(getmtime(CACHE_PATH + str(cache[trans_path]) + "|" + trans_path) - cache[trans_path]) < 2:
		# If it hasn't been changed, find and return the compiled file.
		return open(CACHE_PATH + str(cache[trans_path]) + "|" + trans_path, 'r').read()

	# Get code
	code = open(file_path, 'r').read()

	# Get last reference index
	refIdx = 0
	if "/// <reference path=\"" in code:
		refIdx = code.index("/// <reference path=\"")
		while True:
			while code[refIdx] != "\n": refIdx += 1
			refIdx += 1
			if code[refIdx] != '/' or code[refIdx + 1] != '/' or code[refIdx + 2] != '/' or code[refIdx + 3] != ' ':
				break
	
	# Remove references + encode to base64
	c = b64encode(code[refIdx:].encode("ascii")).decode("ascii")

	# Transpile code
	trans_code = run("echo \"" + escape("import{emit}from\"https://deno.land/x/emit@0.0.1/mod.ts\";let url=\"data:text/typescript;base64," + c + "\";let code=(await emit(url))[url];let i=code.length-5;while(code[i]!=',')i--;i++;let sMap=JSON.parse(atob(code.slice(i)));sMap.sources[0]=\"" + link_path + "\";console.log(code.slice(0,i)+btoa(JSON.stringify(sMap)))") + "\" | deno run -A -")

	# Add to cache

	cache[trans_path] = floor(time())
	f = open(CACHE_PATH + str(cache[trans_path]) + "|" + trans_path, 'w+')
	f.write(trans_code)
	f.close()

	return trans_code

class LocalServer(SimpleHTTPRequestHandler):
	def translate_path(self, path: str) -> str:
		# Remove query parameters
		path = path.split('?',1)[0]
		path = path.split('#',1)[0]

		if path.startswith('./'): path = path[2:]
		if path[0] == '/': path = path[1:]

		# Replace encoded characters
		try: path = urllib.parse.unquote(path, errors='surrogatepass') # type: ignore
		except UnicodeDecodeError: path = urllib.parse.unquote(path) # type: ignore

		# Replace "_" with ".."
		words: List[str] = [(".." if a == "_" else a) for a in path.split('/') if len(a) > 0]

		return "./" + "/".join(words)

	def do_GET(self) -> None:
		print(f"[{self.log_date_time_string()}]: {self.path}")

		# Get file path
		path = self.translate_path(self.path)
		# print(self.path, path)

		# Just send loader if it's main
		if path.endswith("/main"):
			# Get library paths
			scripts: List[str] = []
			originalDir = getcwd()
			chdir("../../")

			f = get_files("./src")
			f = sort_files(f)
			unr, rfd = separate_unreferenced(f, "/Nodes/GlassNode.ts", True)
			scripts += [a for a in unr if not a.endswith(".d.ts")]
			scripts += ["/" + a[0] for a in sort_files(get_files("libTargets/webCompiled/src"))]
			scripts += [a for a in rfd if not a.endswith(".d.ts")]
			chdir(originalDir)

			# Send them as script tags (in order!)
			self.send_text(
				"".join([f"<script src=\"_/_{s}\" defer></script>" for s in scripts])
				+ "<script>window.addEventListener('load', () => { Loader.set('./main.gs'), Loader.init() })</script>"
			)
			# self.send_text("<br>".join(scripts))

			# Exit
			return

		# Check if it's a typescript file
		if path.endswith(".ts"):
			# If it is, send that file, compiled, to the client.
			f = open(path, 'r').read()
			f = transpile(path, self.path)
			self.send_text(f, "text/javascript")

			# Don't bother doing anything else.
			return

		# Send directory when asked for it!
		if path.endswith("/dir.json"):
			self.send_text("[TODO: do directory fetching code in webLocal/build.py]", "text/json")
			return

		# Check if its a Glass Scene file.
		# if path.endswith(".gs"):
		# 	files: List[Path] = list(Path("/".join(path.split("/")[:-1])).rglob("*.[tT][sS]"))
		# 	self.send_text("".join([f'<script src="lib/{relpath(f)}"></script>' for f in files]))
		# 	return

		return super().do_GET()

	def log_message(self: LocalServer, format: str, *args: Any) -> None:
		return

	def send_text(self: LocalServer, text: str, mime: str = "text/html") -> None:
		# Encode data
		t = text.encode(FILE_SYSTEM_ENCODING, 'surrogateescape')
		rf = BytesIO()
		rf.write(t)
		rf.seek(0)

		# Send headers
		self.send_response(HTTPStatus.OK)
		self.send_header("Content-type", mime + "; charset=%s" % FILE_SYSTEM_ENCODING)
		self.send_header("Content-Length", str(len(t)))
		self.end_headers()

		# Send data
		self.copyfile(rf, self.wfile)

		rf.close()


hostName = "localhost"
serverPort = 8080

def compile(path: str, compLib: Callable[[], None]):
	chdir(path)

	webServer = HTTPServer((hostName, serverPort), LocalServer)
	print(f"Server started http://{hostName}:{serverPort}")

	try:
		webServer.serve_forever()
	except KeyboardInterrupt:
		pass

	webServer.server_close()
	print("\nServer stopped.")

	return True