#!/usr/bin/env python3
"""
Local development & sharing server for the modernized MGH CNTR website.
Supports clean SPA routes (/research, /ourteam, /clinical-programs, /podcast, etc.),
static assets, and LAN sharing.
"""

import argparse
import http.server
import os
import socket
import socketserver
from urllib.parse import unquote, urlparse

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))


class CNTRRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        clean_path = unquote(parsed.path)

        # JSON API endpoint
        if clean_path == "/api/data":
            self.path = "/data/cntr-data.json"
            return super().do_GET()

        # Resolve relative asset requests from nested SPA routes (e.g. /news/styles.css -> /styles.css)
        if clean_path.endswith("/styles.css"):
            self.path = "/styles.css"
            return super().do_GET()
        if clean_path.endswith("/app.js"):
            self.path = "/app.js"
            return super().do_GET()
        if clean_path.endswith("/data/cntr-data.js"):
            self.path = "/data/cntr-data.js"
            return super().do_GET()

        # Check if file exists on disk
        fs_path = os.path.join(ROOT_DIR, clean_path.lstrip("/"))
        if os.path.isfile(fs_path):
            return super().do_GET()

        # Fallback all clean routes (/about, /ourteam, /research, /news/..., etc.) to index.html
        self.path = "/index.html"
        return super().do_GET()


def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def main():
    parser = argparse.ArgumentParser(description="Run the modernized MGH CNTR local web server.")
    parser.add_argument("--port", type=int, default=8080, help="Port to listen on (default: 8080)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface (default: 0.0.0.0 for LAN sharing)")
    args = parser.parse_args()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((args.host, args.port), CNTRRequestHandler) as httpd:
        lan_ip = get_lan_ip()
        print("=" * 68)
        print("  MGH Center for Neurotechnology and Neurorecovery (CNTR)")
        print("  Modernized Local Web Server")
        print("=" * 68)
        print(f"  Local URL:            http://localhost:{args.port}/")
        print(f"  Share on Local LAN:   http://{lan_ip}:{args.port}/")
        print(f"  JSON Dataset API:     http://localhost:{args.port}/api/data")
        print("=" * 68)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")


if __name__ == "__main__":
    main()
