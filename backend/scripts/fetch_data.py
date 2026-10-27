import requests
import pandas as pd
import os

BMRS_BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

# Ensure the data directory exists
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../data")
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_actuals():
    print("Fetching FUELHH (Actuals) for Jan 2026...")
    url = f"{BMRS_BASE}/FUELHH/stream"
    params = {
        "publishTimeFrom": "2026-01-01T00:00:00Z",
        "publishTimeTo": "2026-01-31T23:59:59Z"
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    df = pd.DataFrame(response.json())
    
    # Filter for WIND and keep only the necessary columns
    wind_df = df[df['fuelType'] == 'WIND'][['startTime', 'generation']]
    
    out_path = os.path.join(DATA_DIR, "actuals_jan2026.csv")
    wind_df.to_csv(out_path, index=False)
    print(f"Saved actuals to {out_path}")

def fetch_forecasts():
    print("Fetching WINDFOR (Forecasts) for Jan 2026...")
    url = f"{BMRS_BASE}/WINDFOR/stream"
    params = {
        "startTimeFrom": "2026-01-01T00:00:00Z",
        "startTimeTo": "2026-01-31T23:59:59Z"
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    df = pd.DataFrame(response.json())
    
    # Keep only the necessary columns
    df = df[['startTime', 'publishTime', 'generation']]
    
    out_path = os.path.join(DATA_DIR, "forecasts_jan2026.csv")
    df.to_csv(out_path, index=False)
    print(f"Saved forecasts to {out_path}")

if __name__ == "__main__":
    fetch_actuals()
    fetch_forecasts()