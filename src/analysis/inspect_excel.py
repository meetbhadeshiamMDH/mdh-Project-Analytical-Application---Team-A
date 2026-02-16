import pandas as pd
import os
import sys

# Add project root to path if needed, though for this script it might not be strictly necessary
sys.path.append(os.getcwd())

file_path = 'data/3 Bike Thefts.xlsx'

print(f"Inspecting: {file_path}")

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
else:
    try:
        xls = pd.ExcelFile(file_path)
        print(f"Sheet names: {xls.sheet_names}")
        
        # Load the first sheet
        first_sheet_name = xls.sheet_names[0]
        df = pd.read_excel(xls, sheet_name=first_sheet_name)
        
        print(f"\n--- First Sheet: {first_sheet_name} ---")
        print(f"Columns: {df.columns.tolist()}")
        print(f"Shape: {df.shape}")
        print(f"Dtypes:\n{df.dtypes}")
        print(f"\nSample Data:\n{df.head().to_string()}")
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")
