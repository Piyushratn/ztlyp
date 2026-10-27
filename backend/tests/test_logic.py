import pandas as pd
import numpy as np
from app.elexon import apply_decision_cutoff
from app.analysis import calculate_kpis

def test_decision_cutoff_logic():
    # Target delivery: 2026-01-15 12:00:00 UTC
    # Cutoff should be 2026-01-14 09:00:00 UTC
    data = pd.DataFrame({
        'startTime': [pd.Timestamp('2026-01-15 12:00:00', tz='UTC')] * 3,
        'publishTime': [
            pd.Timestamp('2026-01-14 08:00:00', tz='UTC'), # Valid, older
            pd.Timestamp('2026-01-14 09:00:00', tz='UTC'), # Valid, exact cutoff (Should be picked)
            pd.Timestamp('2026-01-14 10:00:00', tz='UTC')  # Invalid, after cutoff
        ],
        'generation': [100, 150, 200]
    })
    
    result = apply_decision_cutoff(data, cutoff_hour=9)
    
    assert len(result) == 1
    assert result.iloc[0]['forecast'] == 150
    assert result.iloc[0]['publishTime'] == pd.Timestamp('2026-01-14 09:00:00', tz='UTC')

def test_calculate_kpis():
    # error = forecast - actual
    df = pd.DataFrame({
        'actual': [100, 100, 100],
        'forecast': [110, 90, 100],
        'error': [10, -10, 0],
        'abs_error': [10, 10, 0]
    })
    
    kpis = calculate_kpis(df)
    
    # MAE should be (10 + 10 + 0) / 3 = 6.66...
    assert np.isclose(kpis['mae'], 20 / 3)
    # Bias should be (10 + -10 + 0) / 3 = 0
    assert kpis['bias'] == 0
    # Worst half-hour error should be 10
    assert kpis['worst_hh_error'] == 10