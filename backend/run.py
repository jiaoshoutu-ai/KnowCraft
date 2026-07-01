#!/usr/bin/env python3
import os
import sys

# Ensure backend directory is in path and clean stale imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

# Insert at beginning to prioritize local modules
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Clear any stale core imports from previous runs
for key in list(sys.modules.keys()):
    if key.startswith('core'):
        del sys.modules[key]

from main import app
import uvicorn
from config import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=True,
    )
