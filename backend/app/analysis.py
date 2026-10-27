import pandas as pd
import numpy as np

def calculate_kpis(df: pd.DataFrame) -> dict:
    """Calculates accuracy metrics based on the provided dataset."""
    mean_actual = df['actual'].mean()
    if mean_actual == 0:
        mean_actual = 1  # Prevent division by zero
        
    return {
        "mae": df['abs_error'].mean(),
        "rmse": np.sqrt((df['error']**2).mean()),
        "bias": df['error'].mean(),
        "mape": (df['abs_error'] / df['actual'].replace(0, np.nan)).mean() * 100,
        "p50_error": df['abs_error'].quantile(0.5),
        "p90_error": df['abs_error'].quantile(0.9),
        "p99_error": df['abs_error'].quantile(0.99),
        "over_forecast_share": (df['error'] > 0).mean() * 100,
        "under_forecast_share": (df['error'] < 0).mean() * 100,
        "worst_hh_error": df['abs_error'].max(),
        "normalized_mae": (df['abs_error'].mean() / mean_actual) * 100,
        "thermal_buffer_90": df['error'].quantile(0.9),
        "thermal_buffer_95": df['error'].quantile(0.95)
    }

def get_decision_view(df: pd.DataFrame, target_date: str) -> list:
    """
    Generates a daily view comparing forecast vs actuals, attaching P10/P90 error bands.
    Bands are calculated STRICTLY using days prior to the target_date to prevent data leakage.
    """
    target_dt = pd.to_datetime(target_date, utc=True)
    
    # 1. Isolate historical data (strictly earlier than the target day)
    historical_df = df[df['startTime'].dt.normalize() < target_dt].copy()
    
    # Group by half-hour index (0 to 47)
    historical_df['hh_index'] = historical_df['startTime'].dt.hour * 2 + (historical_df['startTime'].dt.minute >= 30).astype(int)
    
    if not historical_df.empty:
        # Calculate historical error bounds for each half-hour block
        bands = historical_df.groupby('hh_index')['error'].agg([
            ('p10', lambda x: x.quantile(0.1)),
            ('p90', lambda x: x.quantile(0.9))
        ]).reset_index()
    else:
        # No history available (e.g., the very first day of the dataset)
        bands = pd.DataFrame({'hh_index': range(48), 'p10': 0, 'p90': 0})

    # 2. Extract the data for the target day
    day_df = df[df['startTime'].dt.normalize() == target_dt].copy()
    day_df['hh_index'] = day_df['startTime'].dt.hour * 2 + (day_df['startTime'].dt.minute >= 30).astype(int)
    
    # Merge historical bands onto the target day
    day_df = pd.merge(day_df, bands, on='hh_index', how='left')
    
    # 3. Apply the error bands to the current forecast to create actual generation bounds
    # Since error = forecast - actual, expected actual = forecast - error
    day_df['band_upper'] = day_df['forecast'] - day_df['p10']
    day_df['band_lower'] = day_df['forecast'] - day_df['p90']
    
    # Format startTime and publishTime as ISO strings for JSON serialization
    day_df['startTime'] = day_df['startTime'].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    day_df['publishTime'] = day_df['publishTime'].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    return day_df[['startTime', 'publishTime', 'forecast', 'actual', 'band_lower', 'band_upper']].to_dict(orient='records')