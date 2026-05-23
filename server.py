import http.server
import socketserver
import hashlib
import json
import os

PORT = 8082
# Salt is loaded from the environment variable VISIT_SALT.
# Copy .env.example to .env and set your own value there — never hardcode it here.
SALT = os.environ.get("VISIT_SALT")
if not SALT:
    raise RuntimeError("VISIT_SALT environment variable is not set. Copy .env.example to .env and fill it in.")
LOG_FILE = "visits_anonymized.json"

class AnonymizedLoggingHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Log unique visits only when loading the root or index.html
        if self.path in ["/", "/index.html"]:
            self.log_anonymized_visit()
        
        # Standard static file server serving logic
        super().do_GET()

    def log_anonymized_visit(self):
        # 1. Capture client IP address
        ip = self.client_address[0]
        
        # 2. Hash the IP with the Salt using SHA-256
        hasher = hashlib.sha256()
        hasher.update((ip + SALT).encode('utf-8'))
        hashed_ip = hasher.hexdigest()

        # 3. Load current JSON logs
        logs = {}
        if os.path.exists(LOG_FILE):
            try:
                with open(LOG_FILE, 'r') as f:
                    logs = json.load(f)
            except Exception:
                logs = {}

        # 4. Increment visits without ever logging raw IP data
        if hashed_ip in logs:
            logs[hashed_ip]['visits'] += 1
        else:
            logs[hashed_ip] = {
                'visits': 1
            }

        # 5. Write logs back to file safely
        try:
            with open(LOG_FILE, 'w') as f:
                json.dump(logs, f, indent=4)
        except Exception as e:
            print(f"Error logging visit: {e}")

if __name__ == "__main__":
    # Ensure correct MIME mapping mappings
    AnonymizedLoggingHandler.extensions_map.update({
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
    })
    
    # Bind to localhost to run locally
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), AnonymizedLoggingHandler) as httpd:
        print(f"Serving retro game & anonymizing IP hits at http://127.0.0.1:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
