"""
Vercel serverless function: POST /api/log_visit
Anonymizes visitor IPs using a salted SHA-256 hash and logs unique visit counts.
"""

import hashlib
import json
import os
from http.server import BaseHTTPRequestHandler

SALT = os.environ.get("VISIT_SALT")


class handler(BaseHTTPRequestHandler):

      def do_POST(self):
                if not SALT:
                              self._respond(500, {"error": "VISIT_SALT not set."})
                              return
                          ip = self.headers.get("x-forwarded-for", self.client_address[0]).split(",")[0].strip()
                hashed = hashlib.sha256((ip + SALT).encode()).hexdigest()
                print(f"[visit] hashed_ip={hashed[:12]}...")
                self._respond(200, {"status": "ok"})

      def do_OPTIONS(self):
                self.send_response(204)
                self._cors_headers()
                self.end_headers()

      def _respond(self, code, body):
                payload = json.dumps(body).encode()
                self.send_response(code)
                self._cors_headers()
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)

      def _cors_headers(self):
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")
        
