"""
Data Processing Module

This module handles the cleaning and transformation of bike theft data.
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Tuple, Optional
import os


def load_bike_theft_data(file_path: str = 'data/3 Bike Thefts  FINAL EXCEL 0.xlsx', sheet_name: str = '2023 - 2025 EN') -> pd.DataFrame:
    """
    Load bike theft data from Excel file.
    
    Args:
        file_path: Path to the Excel file
        sheet_name: Name of the sheet to load
        
    Returns:
        DataFrame with bike theft data
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        Exception: For other data loading errors
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Data file not found: {file_path}")
    
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        # Normalize column names: strip whitespace and convert to title case
        # e.g. ' FINANCIAL DAMAGE' -> 'Financial Damage', 'START DATE' -> 'Start Date'
        df.columns = [col.strip().title() for col in df.columns]
        
        # Map specific column names to match expected format
        column_mapping = {
            'Created On': 'Created on',
            'Start Date': 'Start date',
            'Start Hour': 'Start hour',
            'End Date': 'End date',
            'End Hour': 'End hour',
            'Financial Damage': 'Financial damage',
            'Type Of Bicycle': 'Type of bicycle',
            'Offense Type': 'Offense type',
            'Reason For Collection': 'Reason for collection',
        }
        df.rename(columns=column_mapping, inplace=True)
        
        # Translate German values to English
        if 'Attempt' in df.columns:
            df['Attempt'] = df['Attempt'].map({'No': 'No', 'Ja': 'Yes', 'Unbekannt': 'Unknown'}).fillna(df['Attempt'])
        
        # Normalize bicycle types
        if 'Type of bicycle' in df.columns:
            type_mapping = {
                "Men's bike": "Mens bicycle",
                "Women's Bicycle": "Womens bicycle",
                "childrens bicycle": "Childrens bicycle",
                "Mountainbike": "Mountain bike",
                "various bicycles": "Various bicycles",
                "various Bicycles": "Various bicycles",
            }
            # Also handle simple case normalization and stripping
            df['Type of bicycle'] = df['Type of bicycle'].str.strip()
            df['Type of bicycle'] = df['Type of bicycle'].replace(type_mapping)
        
        # Convert date columns to datetime
        date_columns = ['Created on', 'Start date', 'End date']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Clean numeric columns
        if 'Financial damage' in df.columns:
            df['Financial damage'] = pd.to_numeric(df['Financial damage'], errors='coerce')
        
        if 'Start hour' in df.columns:
            df['Start hour'] = pd.to_numeric(df['Start hour'], errors='coerce')
        
        if 'End hour' in df.columns:
            df['End hour'] = pd.to_numeric(df['End hour'], errors='coerce')
        
        return df
    except Exception as e:
        raise Exception(f"Error loading data: {str(e)}")


def get_summary_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate summary statistics for the dataset.
    
    Args:
        df: DataFrame with bike theft data
        
    Returns:
        Dictionary with summary statistics
    """
    total_thefts = len(df)
    
    # Calculate average financial damage (excluding NaN)
    avg_damage = df['Financial damage'].mean() if 'Financial damage' in df.columns else 0
    
    # Get date range
    min_date = df['Start date'].min() if 'Start date' in df.columns else None
    max_date = df['Start date'].max() if 'Start date' in df.columns else None
    
    # Calculate attempt rate
    attempt_rate = 0
    if 'Attempt' in df.columns:
        attempt_count = (df['Attempt'] == 'Yes').sum()
        attempt_rate = (attempt_count / total_thefts * 100) if total_thefts > 0 else 0
    
    return {
        'total_thefts': int(total_thefts),
        'avg_damage': float(round(avg_damage, 2)) if not pd.isna(avg_damage) else 0,
        'min_date': min_date.isoformat() if min_date and not pd.isna(min_date) else None,
        'max_date': max_date.isoformat() if max_date and not pd.isna(max_date) else None,
        'attempt_rate': float(round(attempt_rate, 2)),
        'successful_thefts': int(total_thefts - ((df['Attempt'] == 'Yes').sum() if 'Attempt' in df.columns else 0))
    }


def get_time_series_data(df: pd.DataFrame, freq: str = 'M') -> List[Dict[str, Any]]:
    """
    Get time series data for thefts over time.
    
    Args:
        df: DataFrame with bike theft data
        freq: Frequency for grouping ('D' for daily, 'W' for weekly, 'M' for monthly)
        
    Returns:
        List of dictionaries with date and count
    """
    if 'Start date' not in df.columns:
        return []
    
    # Filter out invalid dates
    df_clean = df[df['Start date'].notna()].copy()
    
    # Group by date frequency
    if freq == 'M':
        df_clean['period'] = df_clean['Start date'].dt.to_period('M')
    elif freq == 'W':
        df_clean['period'] = df_clean['Start date'].dt.to_period('W')
    else:  # Daily
        df_clean['period'] = df_clean['Start date'].dt.to_period('D')
    
    # Count thefts per period
    time_series = df_clean.groupby('period').size().reset_index(name='count')
    time_series['date'] = time_series['period'].dt.to_timestamp()
    
    return [
        {
            'date': row['date'].isoformat(),
            'count': int(row['count'])
        }
        for _, row in time_series.iterrows()
    ]


def get_bicycle_type_distribution(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Get distribution of bicycle types.
    
    Args:
        df: DataFrame with bike theft data
        
    Returns:
        List of dictionaries with bicycle type and count
    """
    if 'Type of bicycle' not in df.columns:
        return []
    
    # Count by bicycle type
    type_counts = df['Type of bicycle'].value_counts()
    
    return [
        {
            'type': str(bicycle_type),
            'count': int(count)
        }
        for bicycle_type, count in type_counts.items()
    ]


def get_hourly_distribution(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Get distribution of thefts by hour of day.
    
    Args:
        df: DataFrame with bike theft data
        
    Returns:
        List of dictionaries with hour and count
    """
    if 'Start hour' not in df.columns:
        return []
    
    # Filter out invalid hours
    df_clean = df[df['Start hour'].notna()].copy()
    
    # Count by hour
    hourly_counts = df_clean['Start hour'].value_counts().sort_index()
    
    return [
        {
            'hour': int(hour),
            'count': int(count)
        }
        for hour, count in hourly_counts.items()
    ]


def get_financial_damage_distribution(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Get distribution of financial damage in ranges.
    
    Args:
        df: DataFrame with bike theft data
        
    Returns:
        List of dictionaries with damage range and count
    """
    if 'Financial damage' not in df.columns:
        return []
    
    # Filter out invalid/missing values
    df_clean = df[df['Financial damage'].notna()].copy()
    
    # Define damage ranges in 100-euro steps up to 3000
    bins = list(range(0, 3100, 100)) + [float('inf')]
    labels = [f'€{bins[i]}-{bins[i+1]}' for i in range(len(bins)-2)] + ['€3000+']
    
    df_clean['damage_range'] = pd.cut(df_clean['Financial damage'], bins=bins, labels=labels, include_lowest=True)
    
    # Count by damage range
    damage_counts = df_clean['damage_range'].value_counts().sort_index()
    
    return [
        {
            'range': str(damage_range),
            'count': int(count)
        }
        for damage_range, count in damage_counts.items()
    ]


def get_daily_stats(df: pd.DataFrame, date_str: str, bike_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Get case count and total financial damage for a specific date.

    Args:
        df: DataFrame with bike theft data
        date_str: Date string in YYYY-MM-DD format
        bike_type: Optional bike type filter

    Returns:
        Dictionary with case_count, total_damage, and has_data flag
    """
    if 'Start date' not in df.columns:
        return {'has_data': False, 'case_count': 0, 'total_damage': 0.0, 'date': date_str}

    try:
        target_date = pd.to_datetime(date_str).normalize()
    except Exception:
        return {'has_data': False, 'case_count': 0, 'total_damage': 0.0, 'date': date_str}

    # Filter rows matching the target date (ignore time component)
    mask = df['Start date'].dt.normalize() == target_date
    day_df = df[mask]
    
    # Filter by bike type if provided
    if bike_type and 'Type of bicycle' in day_df.columns:
        day_df = day_df[day_df['Type of bicycle'] == bike_type]

    if day_df.empty:
        return {'has_data': False, 'case_count': 0, 'total_damage': 0.0, 'date': date_str, 'lor_stats': {'plr': [], 'bzr': []}}

    case_count = int(len(day_df))
    total_damage = 0.0
    if 'Financial damage' in day_df.columns:
        total_damage = float(day_df['Financial damage'].sum(skipna=True))

    return {
        'has_data': True,
        'case_count': case_count,
        'total_damage': round(total_damage, 2),
        'date': date_str,
        'lor_stats': get_lor_metrics(day_df)
    }


def get_weekly_comparison_stats(df: pd.DataFrame, reference_date_str: str, bike_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get a 7-day side-by-side comparison. 
    W1 = 7 days ending on the day before reference_date.
    W2 = The 7 days immediately preceding W1.

    Args:
        df: DataFrame with bike theft data
        reference_date_str: Date string in YYYY-MM-DD format
        bike_type: Optional bike type filter

    Returns:
        List of 7 objects comparing the same weekday across two weeks.
    """
    try:
        ref_date = pd.to_datetime(reference_date_str).normalize()
    except Exception:
        return []
    
    # Filter by bike type globally for the comparison if provided
    comp_df = df
    if bike_type and 'Type of bicycle' in comp_df.columns:
        comp_df = comp_df[comp_df['Type of bicycle'] == bike_type]

    # Yesterday (W1 last day)
    yesterday_date = ref_date - pd.Timedelta(days=1)
    
    # We want to return 7 rows, starting from 'yesterday' and going back 6 more days
    comparison_data = []
    
    for i in range(7):
        w1_day = yesterday_date - pd.Timedelta(days=i)
        w2_day = w1_day - pd.Timedelta(days=7)
        
        # Stats for W1
        mask1 = comp_df['Start date'].dt.normalize() == w1_day
        day1_df = comp_df[mask1]
        w1_stats = {
            'date': w1_day.strftime('%Y-%m-%d'),
            'cases': int(len(day1_df)),
            'damage': float(day1_df['Financial damage'].sum()) if 'Financial damage' in day1_df.columns else 0.0
        }
        
        # Stats for W2
        mask2 = comp_df['Start date'].dt.normalize() == w2_day
        day2_df = comp_df[mask2]
        w2_stats = {
            'date': w2_day.strftime('%Y-%m-%d'),
            'cases': int(len(day2_df)),
            'damage': float(day2_df['Financial damage'].sum()) if 'Financial damage' in day2_df.columns else 0.0
        }
        
        comparison_data.append({
            'weekday': w1_day.strftime('%A'),
            'w1': {**w1_stats, 'lor_stats': get_lor_metrics(day1_df)},
            'w2': {**w2_stats, 'lor_stats': get_lor_metrics(day2_df)}
        })
        
    return comparison_data


def get_lor_metrics(df: pd.DataFrame) -> Dict[str, List[Dict[str, Any]]]:
    """Calculate case counts and damage aggregated by PLR and BZR levels."""
    if df.empty or 'Unnamed: 5' not in df.columns:
        return {'plr': [], 'bzr': []}
    
    # Financial damage column check
    has_damage = 'Financial damage' in df.columns
    
    # Normalize PLR IDs to 8-digit strings
    df_lor = df.copy()
    df_lor['plr_id'] = df_lor['Unnamed: 5'].dropna().astype(str).str.zfill(8)
    df_lor['bzr_id'] = df_lor['plr_id'].str[:6]
    
    # Aggregate by PLR
    plr_agg = df_lor.groupby('plr_id').agg(
        cases=('plr_id', 'size'),
        damage=('Financial damage', 'sum') if has_damage else ('plr_id', lambda x: 0.0)
    ).reset_index()
    
    # Aggregate by BZR
    bzr_agg = df_lor.groupby('bzr_id').agg(
        cases=('bzr_id', 'size'),
        damage=('Financial damage', 'sum') if has_damage else ('bzr_id', lambda x: 0.0)
    ).reset_index()
    
    return {
        'plr': [
            {'id': row['plr_id'], 'cases': int(row['cases']), 'damage': float(round(row['damage'], 2))}
            for _, row in plr_agg.iterrows()
        ],
        'bzr': [
            {'id': row['bzr_id'], 'cases': int(row['cases']), 'damage': float(round(row['damage'], 2))}
            for _, row in bzr_agg.iterrows()
        ]
    }


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the input dataframe.
    
    Args:
        df: Raw DataFrame
        
    Returns:
        Cleaned DataFrame
    """
    df_clean = df.copy()
    
    # Remove completely empty rows
    df_clean = df_clean.dropna(how='all')
    
    # Log data quality issues
    null_counts = df_clean.isnull().sum()
    if null_counts.any():
        print(f"Data quality report - Null values:\n{null_counts[null_counts > 0]}")
    
    return df_clean
