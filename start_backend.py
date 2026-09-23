#!/usr/bin/env python
"""Start backend server properly for production and local environments"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(BASE_DIR, ".venv", "bin", "python")

# Auto-switch to workspace .venv python if started from global/system python
if (sys.prefix == sys.base_prefix or not os.getenv("VIRTUAL_ENV")) and os.path.exists(VENV_PYTHON) and sys.executable != VENV_PYTHON:
    os.environ["VIRTUAL_ENV"] = os.path.join(BASE_DIR, ".venv")
    os.execv(VENV_PYTHON, [VENV_PYTHON] + sys.argv)

BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if os.path.exists(BACKEND_DIR):
    os.chdir(BACKEND_DIR)
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)
else:
    if BASE_DIR not in sys.path:
        sys.path.insert(0, BASE_DIR)

host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8000"))

print(f"🚀 Starting TelecomIQ Backend Server on {host}:{port}...")
import uvicorn
uvicorn.run("app.main:app", host=host, port=port, proxy_headers=True, forwarded_allow_ips="*")
