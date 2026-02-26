"""
Data Processing Module

This module handles the cleaning and transformation of data.
"""

import pandas as pd
import numpy as np

def clean_data(df):
    """
    Clean the input dataframe.
    """
    if df.empty:
        return df

    # Ensure date columns are datetime objects
    # Handling potential errors with coerce to ignore bad data
    if 'Start date' in df.columns:
        df['Start date'] = pd.to_datetime(df['Start date'], errors='coerce')
    
    if 'Created on' in df.columns:
        df['Created on'] = pd.to_datetime(df['Created on'], errors='coerce')
        
    if 'End date' in df.columns:
        df['End date'] = pd.to_datetime(df['End date'], errors='coerce')

    # Convert numeric columns
    numeric_cols = ['Start hour', 'End hour', 'financial damage']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
    # Standardize LOR to 8-digit strings (fix for leading zeros)
    if 'LOR' in df.columns:
        # First remove any .0 from float conversion if present
        df['LOR'] = df['LOR'].astype(str).str.replace(r'\.0$', '', regex=True)
        # Pad with leading zeros to 8 digits
        df['LOR'] = df['LOR'].apply(lambda x: x.zfill(8) if x != 'nan' and x != 'None' else x)
        
    return df


def get_hourly_stats(df):
    """
    Aggregate thefts by 'Start hour'.
    """
    if df.empty or 'Start hour' not in df.columns:
        return {}
    
    # Value counts of start hour, sort by hour
    stats = df['Start hour'].value_counts().sort_index().to_dict()
    # Ensure all hours 0-23 are present? Optional, but good for charts
    # For now, returning existing data counts
    return stats

def get_weekly_stats(df):
    """
    Aggregate thefts by day of week.
    """
    if df.empty or 'Start date' not in df.columns:
        return {}
        
    # extracted_day_name
    day_counts = df['Start date'].dt.day_name().value_counts()
    
    # Sort by standard week order
    week_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    # Reindex to ensure order and fill missing with 0
    day_counts = day_counts.reindex(week_order, fill_value=0)
    
    return day_counts.to_dict()

def get_monthly_stats(df):
    """
    Aggregate thefts by month.
    """
    if df.empty or 'Start date' not in df.columns:
        return {}
    
    # Group by month name
    month_counts = df['Start date'].dt.month_name().value_counts()
    
    month_order = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    month_counts = month_counts.reindex(month_order, fill_value=0)
    
    return month_counts.to_dict()

def get_yearly_stats(df):
    """
    Aggregate thefts by year.
    """
    if df.empty or 'Start date' not in df.columns:
        return {}
        
    year_counts = df['Start date'].dt.year.value_counts().sort_index()
    return year_counts.to_dict()

def get_financial_stats(df):
    """
    Aggregate financial damage by month.
    """
    if df.empty or 'Start date' not in df.columns or 'financial damage' not in df.columns:
        return {}

    # Group by month and sum financial damage
    # We use to_period('M') to get Year-Month (e.g. 2023-01) which is better for financial trends
    # than just 'January' (which aggregates Jan 2022 and Jan 2023)
    # However, to keep it simple and consistent with other charts, let's try monthly summation over time
    
    # Create a temporary column for Year-Month sorting
    temp_df = df.copy()
    temp_df['Month'] = temp_df['Start date'].dt.to_period('M')
    financial_counts = temp_df.groupby('Month')['financial damage'].sum().sort_index()
    
    # Convert Period index to string for JSON serialization
    return {str(k): v for k, v in financial_counts.items()}

def get_lor_stats(df):
    """
    Aggregate thefts by LOR (Planungsraum).
    """
    if df.empty or 'LOR' not in df.columns:
        return {}
    
    # LOR might be numeric or string, ensure consistency
    # Value counts of LOR
    lor_counts = df['LOR'].value_counts().head(50) # Limit to top 50 to avoid overwhelming the map/list
    
    # Convert keys to string to ensure JSON compatibility
    return {str(k): v for k, v in lor_counts.items()}
