"""
API Module

This module defines the API endpoints for the backend.
"""

from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Bike Theft Analysis API"

if __name__ == '__main__':
    app.run(debug=True)
