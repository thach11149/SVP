#!/bin/bash
echo "Starting local server for report..."
echo "Open your browser and go to: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
cd "$(dirname "$0")"
python3 -m http.server 8000
