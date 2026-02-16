# Berlin Bike Theft Analysis Dashboard Walkthrough

I have successfully built and verified the interactive dashboard for analyzing bike theft data in Berlin. The dashboard uses a modern React + TypeScript frontend with Recharts for visualizations and a Flask backend for data processing.

## Accomplishments

- ✅ **Backend Implementation**: Built a Flask API that processes over 57,000 records from the `3 Bike Thefts.xlsx` dataset.
- ✅ **Data Processing**: Implemented advanced pandas logic for temporal trends, bicycle type distribution, and financial damage analysis.
- ✅ **Frontend Development**: Created a responsive React application using the tech stack from your mapping skill (TypeScript + Recharts + Tailwind CSS).
- ✅ **UI/UX Design**: Implemented a modern dark-themed dashboard with glassmorphism effects and interactive charts.
- ✅ **Auto-Integration**: Configured CORS and Proxy settings for seamless frontend-backend communication.

## Final Dashboard

![Berlin Bike Theft Dashboard](/home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/artifacts/bike_theft_dashboard_final.png)

## Key Visualizations

````carousel
```json
{
  "total_thefts": 57277,
  "avg_damage": 1220.1,
  "attempt_rate": 0.43
}
```
<!-- slide -->
![Thefts Over Time Chart](/home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/artifacts/bike_theft_dashboard_final.png)
<!-- slide -->
![Dashboard Interaction Recording](/home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/artifacts/dashboard_demo.webp)
````

## Verified Stats

- **Total Records Processed**: 57,277
- **Data Range**: January 2023 - October 2025
- **Average Financial Damage**: €1,220.10
- **Most Stolen Type**: Mens bicycle

## How to Run

1. **Start the Backend**:
   ```bash
   .venv/bin/python src/backend/api.py
   ```
2. **Start the Frontend**:
   ```bash
   cd src/frontend && npm run dev
   ```
3. Open `http://localhost:5173` in your browser.
