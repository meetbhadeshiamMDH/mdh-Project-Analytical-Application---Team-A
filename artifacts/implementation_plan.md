# Bike Theft Dashboard Implementation Plan

Create an interactive web dashboard to visualize and analyze bike theft data from the Excel file `3 Bike Thefts.xlsx`.

## User Review Required

> [!IMPORTANT]
> This dashboard will be built as a **React + TypeScript application** following the data-analysis-skill specifications. The dashboard will use Recharts for interactive visualizations and shadcn/ui for UI components.
> 
> **Technology Stack:**
> - Backend: Flask API + Python + pandas + numpy
> - Frontend: React + TypeScript + Recharts
> - UI Components: shadcn/ui
> - Build Tool: Vite

## Proposed Changes

### Backend Components

#### [MODIFY] [api.py](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/backend/api.py)
- Add API endpoint `/api/dashboard-data` to serve processed bike theft statistics
- Add endpoint `/api/time-series` for theft trends over time
- Add endpoint `/api/bicycle-types` for bicycle type distribution
- Add endpoint `/api/financial-analysis` for damage analysis
- Add endpoint `/` to serve the dashboard HTML page
- Configure Flask to serve static files (CSS/JS)

#### [MODIFY] [data_processing.py](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/backend/data_processing.py)
- Add `load_bike_theft_data()` function to read Excel file
- Add `get_time_series_data()` for temporal analysis
- Add `get_bicycle_type_distribution()` for type statistics
- Add `get_financial_damage_stats()` for damage analysis
- Add `get_hourly_distribution()` for time-of-day patterns
- Add `get_summary_statistics()` for key metrics (total thefts, avg damage, etc.)

---

### Frontend Components (React + TypeScript)

#### [NEW] [Dashboard.tsx](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/frontend/components/Dashboard.tsx)
Create the main dashboard component with:
- Header with title and key statistics cards (using shadcn/ui Card components)
- Multiple chart sections using Recharts:
  - LineChart: Thefts over time (temporal trends)
  - BarChart: Bicycle types distribution
  - BarChart: Hourly distribution of thefts
  - BarChart: Financial damage ranges
- Date range picker for filtering (shadcn/ui DateRangePicker)
- Responsive grid layout using Tailwind CSS
- Modern, clean design with dark mode aesthetic
- Loading states and error handling

#### [NEW] [StatsCard.tsx](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/frontend/components/StatsCard.tsx)
Create reusable statistics card component:
- Display key metrics (total thefts, avg damage, recovery rate)
- Use shadcn/ui Card component
- Add icons and formatted numbers
- Responsive sizing

#### [NEW] [TheftChart.tsx](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/frontend/components/TheftChart.tsx)
Create reusable chart wrapper component:
- Integrate Recharts components
- Add common chart configurations
- Handle responsive sizing
- Add tooltips and legends

#### [NEW] [api.ts](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/frontend/lib/api.ts)
Create API client with TypeScript types:
- Type-safe fetch wrappers for all API endpoints
- Error handling and retry logic
- Data transformation utilities

---

### Configuration Updates

#### [MODIFY] [requirements.txt](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/requirements.txt)
- Already contains: flask, pandas, openpyxl, numpy
- Add: flask-cors (for handling React frontend CORS requests)

#### [NEW] [package.json](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/frontend/package.json)
Create Node.js configuration with dependencies:
- react, react-dom
- typescript
- recharts
- shadcn/ui components
- tailwindcss
- vite (build tool)

#### [NEW] [vite.config.ts](file:///home/meet/Analytical%20Application/mdh-Project-Analytical-Application---Team-A/src/frontend/vite.config.ts)
Configure Vite build tool:
- Set up React plugin
- Configure proxy to Flask backend (http://localhost:5000)
- Set up path aliases

## Verification Plan

### Automated Tests
No automated tests will be created for this initial implementation. Future iterations can add tests for data processing functions.

### Manual Verification
1. **Start the Flask backend:**
   ```bash
   cd "/home/meet/Analytical Application/mdh-Project-Analytical-Application---Team-A"
   .venv/bin/python src/backend/api.py
   ```

2. **Start the React frontend (separate terminal):**
   ```bash
   cd "/home/meet/Analytical Application/mdh-Project-Analytical-Application---Team-A/src/frontend"
   npm run dev
   ```

3. **Verify the dashboard loads:**
   - Open browser to `http://localhost:5173` (Vite dev server)
   - Confirm React app loads without errors
   - Verify all statistics cards display correct numbers from API

4. **Verify visualizations:**
   - Check that the "Thefts Over Time" Recharts LineChart displays temporal trends
   - Check that the "Bicycle Types" BarChart shows distribution
   - Check that the "Hourly Distribution" BarChart shows time-of-day patterns
   - Check that the "Financial Damage" BarChart displays damage ranges
   - Confirm all charts are interactive (hover tooltips, responsive)

5. **Test date range filtering:**
   - Use the date range picker to filter data
   - Verify charts update correctly

6. **Test API endpoints:**
   - Manually visit `http://localhost:5000/api/dashboard-data` to verify JSON response
   - Verify CORS headers are set correctly

7. **Responsive design:**
   - Resize browser window to verify Recharts and Tailwind layout adjust properly
   - Test on different screen sizes

8. **Console check:**
   - Open browser developer console (F12)
   - Verify no TypeScript/React errors
   - Check Network tab to confirm all API calls succeed
