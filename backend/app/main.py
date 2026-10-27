from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import app.elexon as elexon
import app.analysis as analysis
from functools import lru_cache

app = FastAPI(title="Wind Forecast Monitor API")

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production (e.g., to your Vercel URL)
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache the dataset in memory to avoid reading CSVs on every request
@lru_cache(maxsize=1)
def get_cached_df(cutoff_hour: int = 9):
    return elexon.build_dataset(cutoff_hour)

class DayViewResponse(BaseModel):
    kpis: Dict[str, float]
    chart_data: List[Dict[str, Any]]

@app.get("/api/decision-view", response_model=DayViewResponse)
def decision_view(
    date: str = Query("2026-01-15T00:00:00Z", description="Target delivery date"), 
    cutoff: int = Query(9, description="Cutoff hour on D-1")
):
    df = get_cached_df(cutoff)
    
    # Generate the chart data with P10/P90 bands for the specific day
    chart_data = analysis.get_decision_view(df, date)
    
    # Calculate KPIs for the entire dataset up to the target date for a general overview
    # (Replacing NaNs with 0 to prevent JSON serialization errors)
    kpis = analysis.calculate_kpis(df)
    clean_kpis = {k: (0.0 if str(v) == 'nan' else float(v)) for k, v in kpis.items()}
    
    return DayViewResponse(kpis=clean_kpis, chart_data=chart_data)