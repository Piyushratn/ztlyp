import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function App() {
  const [date, setDate] = useState('2026-01-16T00:00:00Z');
  const [data, setData] = useState({ kpis: null, chart_data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Connected directly to your live Vercel Backend!
        const response = await axios.get(`https://backend-three-iota-44.vercel.app/api/decision-view?date=${date}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, [date]);

  const { kpis, chart_data } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wind Forecast Monitor</h1>
            <p className="text-gray-500 mt-1">Day-Ahead Power Purchasing (D-1 09:00 UTC Cutoff)</p>
          </div>
          <select 
            className="border-gray-300 border rounded-md shadow-sm p-2 bg-white font-medium"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            <option value="2026-01-14T00:00:00Z">Jan 14, 2026</option>
            <option value="2026-01-15T00:00:00Z">Jan 15, 2026</option>
            <option value="2026-01-16T00:00:00Z">Jan 16, 2026</option>
            <option value="2026-01-17T00:00:00Z">Jan 17, 2026</option>
            <option value="2026-01-18T00:00:00Z">Jan 18, 2026</option>
          </select>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2 flex justify-between">
                MAE (Normalized) <span className="text-gray-400 cursor-help" title="Mean Absolute Error as % of Capacity">ⓘ</span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{(kpis as any).normalized_mae?.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2 flex justify-between">
                Bias <span className="text-gray-400 cursor-help" title="Average error (positive = overforecast)">ⓘ</span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{(kpis as any).bias?.toFixed(1)} MW</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2 flex justify-between">
                Thermal Buffer (90%) <span className="text-gray-400 cursor-help" title="Reserve needed to cover 90% of shortfalls">ⓘ</span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{(kpis as any).thermal_buffer_90?.toFixed(0)} MW</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium mb-2 flex justify-between">
                Over-Forecast Share <span className="text-gray-400 cursor-help" title="% of half-hours where forecast > actual">ⓘ</span>
              </h3>
              <p className="text-3xl font-bold text-gray-900">{((kpis as any).over_forecast_share * 100)?.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Day Forecast vs Actuals</h2>
          
          <div className="h-[500px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Loading data...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart_data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="startTime" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    minTickGap={30}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `${val} MW`}
                    stroke="#9ca3af"
                  />
                  {/* FIX: Typecasted to 'any' to resolve strict TypeScript Vercel build errors */}
                  <Tooltip 
                    labelFormatter={(label: any) => new Date(label).toLocaleString()}
                    formatter={(value: any, name: any) => [`${Math.round(value)} MW`, name]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  
                  {/* P10-P90 Uncertainty Band */}
                  <Area 
                    type="monotone" 
                    dataKey="band_upper" 
                    stroke="none" 
                    fill="#e5e7eb" 
                    name="Historical P10-P90 Band" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="band_lower" 
                    stroke="none" 
                    fill="#ffffff" 
                    tooltipType="none"
                    name="" 
                  />
                  
                  {/* Actual Generation */}
                  <Area 
                    type="stepAfter" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    fill="none" 
                    strokeWidth={2}
                    name="Actual Generation" 
                  />
                  
                  {/* Latest Valid Forecast */}
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#3b82f6" 
                    fill="none"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Latest Forecast (D-1)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Note Footer */}
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
          <strong>Note:</strong> The grey uncertainty band represents historical P10-P90 forecast errors. It is built strictly from days prior to the selected delivery date to prevent data leakage.
        </div>

      </div>
    </div>
  );
}