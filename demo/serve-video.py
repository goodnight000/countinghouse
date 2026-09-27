# Serves one file to the YouTube Studio tab in the user's Chrome (local only, CORS + private-network preflight).
# usage: python3 demo/serve-video.py /path/video.mp4   -> http://127.0.0.1:8765/video.mp4
import http.server, sys, os

PATH = sys.argv[1]

class H(http.server.BaseHTTPRequestHandler):
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204); self.cors(); self.end_headers()

    def do_GET(self):
        size = os.path.getsize(PATH)
        self.send_response(200); self.cors()
        self.send_header("Content-Type", "video/mp4"); self.send_header("Content-Length", str(size)); self.end_headers()
        with open(PATH, "rb") as f:
            self.wfile.write(f.read())

http.server.ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
