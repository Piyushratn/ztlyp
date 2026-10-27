import pandas as pd
import os

# Resolve the absolute path to the data directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "../data")

def load_data():
    """Loads CSV snapshots and standardizes timestamps to UTC."""
    actuals = pd.read_csv(os.path.join(DATA_DIR, "actuals_jan2026.csv"))
    forecasts = pd.read_csv(os.path.join(DATA_DIR, "forecasts_jan2026.csv"))
    
    # Ensure all timestamps are UTC datetimes
    actuals['startTime'] = pd.to_datetime(actuals['startTime'], utc=True)
    forecasts['startTime'] = pd.to_datetime(forecasts['startTime'], utc=True)
    forecasts['publishTime'] = pd.to_datetime(forecasts['publishTime'], utc=True)
    
    return actuals, forecasts

def apply_decision_cutoff(forecasts: pd.DataFrame, cutoff_hour: int = 9) -> pd.DataFrame:
    """
    Applies the D-1 decision cutoff rule:
    For each target startTime, use the LATEST forecast published before or at the cutoff.
    Cutoff = (delivery day - 1 day) at 09:00 UTC.
    """
    df = forecasts.copy()
    
    # Extract the delivery date (stripping the time)
    df['delivery_date'] = df['startTime'].dt.normalize()
    
    # Calculate Cutoff: (Delivery Day - 1) at the specified hour
    df['cutoff_time'] = df['delivery_date'] - pd.Timedelta(days=1) + pd.Timedelta(hours=cutoff_hour)
    
    # Strictly filter out any forecasts published after the cutoff time
    valid_forecasts = df[df['publishTime'] <= df['cutoff_time']]
    
    # For each half-hour delivery slot, get the forecast with the latest publishTime
    idx = valid_forecasts.groupby('startTime')['publishTime'].idxmax()
    latest_forecasts = valid_forecasts.loc[idx]
    
    return latest_forecasts[['startTime', 'publishTime', 'generation']].rename(columns={'generation': 'forecast'})

def build_dataset(cutoff_hour: int = 9):
    """Orchestrates data loading, cutoff application, and error calculation."""
    actuals, forecasts = load_data()
    valid_forecasts = apply_decision_cutoff(forecasts, cutoff_hour)
    
    # Merge Actuals and valid Forecasts
    merged = pd.merge(actuals, valid_forecasts, on='startTime', how='inner')
    merged = merged.rename(columns={'generation': 'actual'})
    
    # Calculate error metrics
    # Positive error = over-forecast (risk of shortfall, meaning we need to buy more)
    merged['error'] = merged['forecast'] - merged['actual']
    merged['abs_error'] = merged['error'].abs()
    
    # Forecast horizon in hours
    merged['horizon'] = (merged['startTime'] - merged['publishTime']).dt.total_seconds() / 3600
    
    return merged.sort_values('startTime').reset_index(drop=True)