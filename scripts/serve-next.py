"""Serve the Next static export at the same subpath as GitHub Pages."""
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse
from serve import RangeRequestHandler

PREFIX = '/sagarjayswal.github.io'


class ExportHandler(RangeRequestHandler):
    def translate_path(self, path):
        parsed = urlsplit(path)
        return super().translate_path(parsed.path[len(PREFIX):])

    def valid_path(self):
        path = urlsplit(self.path).path
        self._remaining = None
        if path in ('/', PREFIX):
            self.send_response(302)
            self.send_header('Location', PREFIX + '/')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return False
        if not path.startswith(PREFIX + '/'):
            self.send_error(404)
            return False
        return True

    def do_GET(self):
        if self.valid_path():
            super().do_GET()

    def do_HEAD(self):
        if self.valid_path():
            super().do_HEAD()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    directory = Path(__file__).resolve().parents[1] / 'out'
    if not (directory / 'index.html').exists():
        raise SystemExit('Run npm run build first.')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(ExportHandler, directory=str(directory)))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
