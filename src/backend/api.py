"""
API Module

This module defines the API endpoints for the backend.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys

# ... existing code ...


# Add current directory to path to allow imports if running from src/backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data_ingestion import load_data
from data_processing import clean_data, get_hourly_stats, get_weekly_stats, get_monthly_stats, get_yearly_stats, get_financial_stats, get_lor_stats

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# DATA Loading strategy
# For this simple app, we can load data on startup.
# In production, this might be a database connection.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'bike_thefts_berlin.xlsx')

print(f"Loading data from: {DATA_FILE}")
raw_df = load_data(DATA_FILE)
df = clean_data(raw_df)
print(f"Data loaded. Rows: {len(df)}")

@app.route('/')
def home():
    return "Bike Theft Analysis API is Running"

@app.route('/api/stats/hourly')
def hourly_stats():
    data = get_hourly_stats(df)
    # Convert keys (integers) to strings for consistency in JSON
    return jsonify({str(k): v for k, v in data.items()})

@app.route('/api/stats/weekly')
def weekly_stats():
    data = get_weekly_stats(df)
    return jsonify(data)

@app.route('/api/stats/monthly')
def monthly_stats():
    data = get_monthly_stats(df)
    return jsonify(data)

@app.route('/api/stats/yearly')
def yearly_stats():
    data = get_yearly_stats(df)
    # Convert keys (years) to strings
    return jsonify({str(k): v for k, v in data.items()})

@app.route('/api/stats/financial')
def financial_stats():
    data = get_financial_stats(df)
    return jsonify(data)

@app.route('/api/stats/lor')
def lor_stats():
    data = get_lor_stats(df)
    return jsonify(data)

@app.route('/api/stats/summary')
def summary_stats():
    """
    Get high-level KPI summary statistics.
    """
    if df.empty:
        return jsonify({
            "total_thefts": 0,
            "avg_damage": 0,
            "most_common_hour": "N/A",
            "top_district": "N/A"
        })
    
    total_thefts = len(df)
    avg_damage = float(df['financial damage'].mean()) if 'financial damage' in df.columns else 0
    most_common_hour = int(df['Start hour'].mode()[0]) if 'Start hour' in df.columns and not df['Start hour'].mode().empty else "N/A"
    top_district = str(df['LOR'].mode()[0]) if 'LOR' in df.columns and not df['LOR'].mode().empty else "N/A"

    return jsonify({
        "total_thefts": total_thefts,
        "avg_damage": round(float(avg_damage), 2),
        "most_common_hour": most_common_hour,
        "top_district": top_district
    })



@app.route('/api/stats/filter-options')
def filter_options():
    """
    Get unique values for filtering options.
    """
    if df.empty:
        return jsonify({
            "bike_types": [],
            "months": [],
            "years": [],
            "lors": []
        })

    bike_types = sorted(df['Type of bicycle'].dropna().unique().tolist())
    
    # Months order
    month_order = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    available_months = df['Start date'].dt.month_name().unique().tolist()
    months = [m for m in month_order if m in available_months]
    
    years = sorted(df['Start date'].dt.year.dropna().unique().astype(int).tolist())
    lors = sorted(df['LOR'].dropna().unique().tolist())[:100] # Limit LORs to first 100 for performance

    return jsonify({
        "bike_types": bike_types,
        "months": months,
        "years": years,
        "lors": lors
    })

@app.route('/api/stats/filtered', methods=['POST'])
def filtered_stats():
    """
    Get incident count based on selected filters.
    """
    from flask import request
    filters = request.get_json() or {}
    
    filtered_df = df.copy()
    
    if filters.get('bike_types'):
        filtered_df = filtered_df[filtered_df['Type of bicycle'].isin(filters['bike_types'])]
    
    if filters.get('months'):
        filtered_df = filtered_df[filtered_df['Start date'].dt.month_name().isin(filters['months'])]
        
    if filters.get('years'):
        filtered_df = filtered_df[filtered_df['Start date'].dt.year.isin(filters['years'])]
        
    if filters.get('lors'):
        filtered_df = filtered_df[filtered_df['LOR'].isin(filters['lors'])]

    return jsonify({
        "count": len(filtered_df),
        "avg_damage": round(float(filtered_df['financial damage'].mean()), 2) if not filtered_df.empty and 'financial damage' in filtered_df.columns else 0
    })

@app.route('/api/stats/geospatial')
def geospatial_stats():
    """
    Aggregate statistics by LOR for heatmap visualization.
    """
    if df.empty or 'LOR' not in df.columns:
        return jsonify({})
    
    # Group by LOR and calculate count and financial damage sum
    geo_stats = df.groupby('LOR').agg({
        'LOR': 'count',
        'financial damage': 'sum'
    }).rename(columns={'LOR': 'theft_count', 'financial damage': 'total_damage'}).reset_index()
    
    # Convert to dictionary with LOR as key
    result = {str(row['LOR']): {
        'count': int(row['theft_count']),
        'damage': float(row['total_damage'])
    } for _, row in geo_stats.iterrows()}
    
    return jsonify(result)

if __name__ == '__main__':

    app.run(debug=True, port=5000)

