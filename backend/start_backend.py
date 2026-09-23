#!/usr/bin/env python
"""Start backend server properly for production and local environments"""
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
VENV_PYTHON = os.path.join(ROOT_DIR, ".venv", "bin", "python")

# Auto-switch to workspace .venv python if started from global/system python
if (sys.prefix == sys.base_prefix or not os.getenv("VIRTUAL_ENV")) and os.path.exists(VENV_PYTHON) and sys.executable != VENV_PYTHON:
    os.environ["VIRTUAL_ENV"] = os.path.join(ROOT_DIR, ".venv")
    os.execv(VENV_PYTHON, [VENV_PYTHON] + sys.argv)

os.chdir(BASE_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

host = os.getenv("HOST", "0.0.0.0")
port = int(os.getenv("PORT", "8000"))

print(f"🚀 Starting TelecomIQ Backend Server on {host}:{port}...")
import uvicorn
uvicorn.run("app.main:app", host=host, port=port, proxy_headers=True, forwarded_allow_ips="*")
