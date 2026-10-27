import pandas as pd
import numpy as np
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")

def generate_mock_data():
    print("Generating synthetic wind data...")
    dates = pd.date_range("2026-01-01", "2026-01-31 23:30:00", freq="30min", tz="UTC")
    
    base_wind = 5000 + 3000 * np.sin(np.arange(len(dates)) / 20.0)
    actuals = base_wind + np.random.normal(0, 500, len(dates))
    
    forecasts = actuals + np.random.normal(0, 800, len(dates)) 
    # FIX: Publish forecasts 36 hours in advance so they pass the strictly enforced D-1 09:00 UTC cutoff!
    publish_times = dates - pd.Timedelta(hours=36)

    df_actuals = pd.DataFrame({"startTime": dates, "generation": actuals.clip(min=0)})
    df_forecasts = pd.DataFrame({"startTime": dates, "publishTime": publish_times, "generation": forecasts.clip(min=0)})

    df_actuals.to_csv(os.path.join(DATA_DIR, "actuals_jan2026.csv"), index=False)
    df_forecasts.to_csv(os.path.join(DATA_DIR, "forecasts_jan2026.csv"), index=False)
    print("Success! Restart your FastAPI server.")

if __name__ == "__main__":
    generate_mock_data()