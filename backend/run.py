import os
from flask import Flask
from .app.app import create_app

app = create_app()

# 최상단에서 즉시 검사 (최적화 모드에서도 동작하도록 if문으로)
if not isinstance(app, Flask):
    raise RuntimeError(f"create_app() returned {type(app)}: {app!r}")

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(host=host, port=port, debug=debug)
