"""
API Module

This module defines the API endpoints for the bike theft analysis backend.
"""
import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
from datetime import datetime, timedelta

# Add parent directory to path to allow imports from backend module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data_processing import (
    load_bike_theft_data,
    get_summary_statistics,
    get_time_series_data,
    get_bicycle_type_distribution,
    get_hourly_distribution,
    get_financial_damage_distribution,
    get_daily_stats,
    get_weekly_comparison_stats
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
        'info': 'Access /api/help for a list of available endpoints.'
    })


@app.route('/api/lor-geojson')
def get_lor_geojson():
    """Serve the reprojected LOR Planungsräume GeoJSON."""
    geojson_path = os.path.join('data', 'lor_plr_4326.geojson')
    if not os.path.exists(geojson_path):
        return jsonify({'error': 'GeoJSON file not found'}), 404
    
    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/bzr-geojson')
def get_bzr_geojson():
    """Serve the reprojected BZR Bezirksregionen GeoJSON."""
    geojson_path = os.path.join('data', 'lor_bzr_4326.geojson')
    if not os.path.exists(geojson_path):
        return jsonify({'error': 'GeoJSON file not found'}), 404
    
    try:
        with open(geojson_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/bike-categories')
def get_bike_categories():
    """Get list of unique bicycle types."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500
    
    try:
        if 'Type of bicycle' in bike_data.columns:
            categories = sorted(bike_data['Type of bicycle'].dropna().unique().tolist())
            return jsonify(categories)
        return jsonify([])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/help')
def get_help():
    """List all available API endpoints."""
    return jsonify({
        'endpoints': [
            '/api/summary',
            '/api/time-series',
            '/api/bicycle-types',
            '/api/hourly-distribution',
            '/api/financial-damage',
            '/api/daily-stats',
            '/api/weekly-comparison',
            '/api/lor-geojson',
            '/api/bzr-geojson',
            '/api/bike-categories',
            '/api/help'
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



@app.route('/api/daily-stats')
def get_daily_stats_endpoint():
    """Get case count and total financial damage for a specific date."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500

    date_str = request.args.get('date')
    bike_type = request.args.get('bike_type')
    if not date_str:
        return jsonify({'error': 'Missing required query parameter: date (YYYY-MM-DD)'}), 400

    try:
        stats = get_daily_stats(bike_data, date_str, bike_type)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/weekly-comparison')
def get_weekly_comparison_endpoint():
    """Get a 7-day side-by-side comparison (W1 vs W2)."""
    if bike_data is None:
        return jsonify({'error': 'Data not loaded'}), 500

    date_str = request.args.get('date')
    bike_type = request.args.get('bike_type')
    if not date_str:
        return jsonify({'error': 'Missing required query parameter: date (YYYY-MM-DD)'}), 400

    try:
        stats = get_weekly_comparison_stats(bike_data, date_str, bike_type)
        return jsonify(stats)
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
