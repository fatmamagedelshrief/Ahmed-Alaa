"""Regenerates assets/img/og-image.jpg (1200x630) from the closed-curtain screen.
Only needed if you change names/date.  Requires:  pip install playwright pillow && playwright install chromium
Run from the project folder:  python3 tools/make-og.py"""
import http.server, threading, functools, io
from playwright.sync_api import sync_playwright
from PIL import Image
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8799), functools.partial(http.server.SimpleHTTPRequestHandler, directory="."))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.goto("http://127.0.0.1:8799/index.html?og"); pg.wait_for_timeout(1200)
    png = pg.screenshot(); b.close()
Image.open(io.BytesIO(png)).convert("RGB").save("assets/img/og-image.jpg", quality=88, optimize=True, progressive=True)
print("saved assets/img/og-image.jpg")
