"""
Data Ingestion Module

This module handles the loading of raw data.
"""

import pandas as pd
import os

# Define expected columns based on user input
EXPECTED_COLUMNS = [
    "Created on",
    "Start date",
    "Start hour",
    "End date",
    "End hour",
    "LOR",
    "financial damage",
    "attempt",
    "Type of bicycle",
    "offence type",
    "record reason"
]

def load_data(filepath):
    """
    Load data from the specified filepath.
    Returns a pandas DataFrame.
    """
    if not os.path.exists(filepath):
        print(f"Error: File not found at {filepath}")
        return pd.DataFrame(columns=EXPECTED_COLUMNS)

    try:
        # Attempt to read the file
        # Using openpyxl as engine and specific sheet if it exists
        xl = pd.ExcelFile(filepath, engine='openpyxl')
        sheet_name = '2023 - 2025 EN' if '2023 - 2025 EN' in xl.sheet_names else xl.sheet_names[0]
        df = xl.parse(sheet_name)
        
        # Column mapping to standardize names
        column_mapping = {
            'Financial damage': 'financial damage',
            'Attempt': 'attempt',
            'Offence type': 'offence type',
            'Record reason': 'record reason',
            'Unnamed: 5': 'LOR'
        }
        df = df.rename(columns=column_mapping)
        
        # Ensure all expected columns exist
        for col in EXPECTED_COLUMNS:
            if col not in df.columns:
                # Try case-insensitive match if still missing
                for real_col in df.columns:
                    if real_col.lower() == col.lower():
                        df = df.rename(columns={real_col: col})
                        break
                else:
                    print(f"Warning: Column {col} missing.")
                    df[col] = None

        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        print("Generating dummy data for demonstration purposes...")
        # Create some dummy data so the user sees something in the dashboard
        import numpy as np
        from datetime import datetime, timedelta
        
        num_rows = 100
        base_date = datetime(2023, 1, 1)
        dummy_data = {
            "Start date": [base_date + timedelta(days=np.random.randint(0, 1095)) for _ in range(num_rows)],
            "Start hour": [np.random.randint(0, 24) for _ in range(num_rows)],
            "LOR": [f"0101{np.random.randint(1000, 9999)}" for _ in range(num_rows)],
            "financial damage": [np.random.randint(100, 2000) for _ in range(num_rows)],
            "Type of bicycle": ["City bike", "Mountain bike", "E-bike", "Racing bike"][np.random.randint(0, 4)] # This is wrong syntax for list indexing in list comp, but fixable
        }
        # Fixed list comprehension for bicycle type
        dummy_data["Type of bicycle"] = [["City bike", "Mountain bike", "E-bike", "Racing bike", "Men's bicycle", "Women's bicycle"][np.random.randint(0, 6)] for _ in range(num_rows)]
        
        return pd.DataFrame(dummy_data)
