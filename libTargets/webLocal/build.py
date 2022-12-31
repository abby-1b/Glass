from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, HTTPServer
from typing import List, Any, Callable

# from subprocess import getoutput as run
from subprocess import Popen
from base64 import b64encode
from io import BytesIO
from http import HTTPStatus
import sys
FILE_SYSTEM_ENCODING: str = sys.getfilesystemencoding()

from os import chdir, getcwd

from urllib.parse import unquote
from urllib.request import urlopen

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

# Transpile TS to JS
transpile_server = Popen(["deno", "run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "../../libTargets/webLocal/tsCompile.ts"])
def transpile(file_path: str, link_path: str):
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
	# trans_code = run("echo \"" + escape("import{emit}from\"https://deno.land/x/emit@0.0.1/mod.ts\";let url=\"data:text/typescript;base64," + c + "\";let code=(await emit(url))[url];let i=code.length-5;while(code[i]!=',')i--;i++;let sMap=JSON.parse(atob(code.slice(i)));sMap.sources[0]=\"" + link_path + "\";console.log(code.slice(0,i)+btoa(JSON.stringify(sMap)))") + "\" | deno run -A -")
	trans_code = urlopen("http://localhost:1165/" + c + "?" + link_path).read().decode("ascii")

	return trans_code

class LocalServer(SimpleHTTPRequestHandler):
	def translate_path(self, path: str) -> str:
		# Remove query parameters
		path = path.split('?',1)[0]
		path = path.split('#',1)[0]

		if path.startswith('./'): path = path[2:]
		if path[0] == '/': path = path[1:]

		# Replace encoded characters
		try: path = unquote(path, errors='surrogatepass')
		except UnicodeDecodeError: path = unquote(path)

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
			scripts += ["/" + a[0] for a in sort_files(get_files("libTargets/_web/src"))]
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
	transpile_server.kill()
	print("\nServer stopped.")

	return True
