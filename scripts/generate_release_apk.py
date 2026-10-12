#!/usr/bin/env python3
import subprocess
import sys
import os

# Redirect to official release APK builder
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_SCRIPT = os.path.join(SCRIPT_DIR, 'build_production_release.py')

if __name__ == '__main__':
    res = subprocess.run([sys.executable, TARGET_SCRIPT])
    sys.exit(res.returncode)
