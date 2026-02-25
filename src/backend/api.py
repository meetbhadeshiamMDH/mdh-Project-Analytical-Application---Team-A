"""
API Module

This module defines the API endpoints for the bike theft analysis backend.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path to allow imports from backend module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data_processing import (
    load_bike_theft_data,
    get_summary_statistics,
    get_time_series_data,
    get_bicycle_type_distribution,
    get_hourly_distribution,
    get_financial_damage_distribution
)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load data once at startup
DATA_FILE = 'data/3 Bike Thefts  FINAL EXCEL 0.xlsx'
try:
    bike_data = load_bike_theft_data(DATA_FILE)
    print(f"✓ Successfully loaded {len(bike_data)} records from {DATA_FILE}")
except Exception as e:
    print(f"✗ Error loading data: {e}")
    bike_data = None


@app.route('/')
def home():
    """Root endpoint."""
    return jsonify({
        'message': 'Bike Theft Analysis API',
        'version': '1.0',
        'endpoints': [
            '/api/summary',
            '/api/time-series',
            '/api/bicycle-types',
            '/api/hourly-distribution',
            '/api/financial-damage',
            '/api/dashboard-data'
        ]
    })


@app.route('/api/summary')
def get_summary():
    """Get summary statistics."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        stats = get_summary_statistics(bike_data)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/time-series')
def get_time_series():
    """Get time series data for thefts over time."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        time_series = get_time_series_data(bike_data, freq='M')
        return jsonify(time_series)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/bicycle-types')
def get_bicycle_types():
    """Get bicycle type distribution."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        bicycle_types = get_bicycle_type_distribution(bike_data)
        return jsonify(bicycle_types)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/hourly-distribution')
def get_hourly():
    """Get hourly distribution of thefts."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        hourly = get_hourly_distribution(bike_data)
        return jsonify(hourly)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/financial-damage')
def get_financial():
    """Get financial damage distribution."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        financial = get_financial_damage_distribution(bike_data)
        return jsonify(financial)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard-data')
def get_dashboard_data():
    """Get all dashboard data in one request."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        dashboard_data = {
            'summary': get_summary_statistics(bike_data),
            'timeSeries': get_time_series_data(bike_data, freq='M'),
            'bicycleTypes': get_bicycle_type_distribution(bike_data),
            'hourlyDistribution': get_hourly_distribution(bike_data),
            'financialDamage': get_financial_damage_distribution(bike_data)
        }
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    if bike_data is not None:
        print(f"\n🚀 Starting Flask server...")
        print(f"📊 Dashboard API available at: http://localhost:5000")
        print(f"📈 Data endpoints ready\n")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Cannot start server - data loading failed")
