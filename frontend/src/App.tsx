import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Info } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [date, setDate] = useState('2026-01-15T00:00:00Z');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch from your FastAPI backend
    axios.get(`https://backend-git-main-piyushratn932-5174s-projects.vercel.app/`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wind Forecast Monitor</h1>
          <p className="text-gray-500 mt-1">Day-Ahead Power Purchasing (D-1 09:00 UTC Cutoff)</p>
        </div>
        <select 
          className="p-2 border border-gray-300 rounded-lg shadow-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          value={date} 
          onChange={(e) => setDate(e.target.value)}
        >
          <option value="2026-01-14T00:00:00Z">Jan 14, 2026</option>
          <option value="2026-01-15T00:00:00Z">Jan 15, 2026</option>
          <option value="2026-01-16T00:00:00Z">Jan 16, 2026</option>
          <option value="2026-01-17T00:00:00Z">Jan 17, 2026</option>
          <option value="2026-01-18T00:00:00Z">Jan 18, 2026</option>
        </select>
      </header>

      {loading || !data ? (
        <div className="flex items-center justify-center h-64 text-gray-500 font-medium">Loading dataset...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <KpiCard 
              title="MAE (Normalized)" 
              value={`${data.kpis.normalized_mae.toFixed(1)}%`} 
              tooltip="Mean Absolute Error normalized by the average actual generation." 
            />
            <KpiCard 
              title="Bias" 
              value={`${data.kpis.bias.toFixed(1)} MW`} 
              tooltip="Positive means we systematically over-forecasted (risk of shortfall)." 
            />
            <KpiCard 
              title="Thermal Buffer (90%)" 
              value={`${data.kpis.thermal_buffer_90.toFixed(0)} MW`} 
              tooltip="Extra thermal generation needed on standby to cover 90% of wind shortfall scenarios." 
            />
            <KpiCard 
              title="Over-Forecast Share" 
              value={`${data.kpis.over_forecast_share.toFixed(1)}%`} 
              tooltip="Percentage of half-hours where forecast was higher than actual generation." 
            />
          </div>

          {/* Main Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Delivery Day Forecast vs Actuals</h2>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="startTime" 
                    tickFormatter={(tick) => {
                      const d = new Date(tick);
                      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }} 
                    tickMargin={10}
                  />
                  <YAxis 
                    label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft', offset: -5 }} 
                    tickMargin={10}
                  />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleString()} 
                    formatter={(value: number) => [`${value.toFixed(1)} MW`]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  
                  {/* Uncertainty Bands */}
                  <Area type="monotone" name="Historical P10-P90 Band" dataKey="band_upper" stroke="none" fill="#f3f4f6" />
                  <Area type="monotone" dataKey="band_lower" stroke="none" fill="#ffffff" legendType="none" tooltipType="none" />
                  
                  {/* Forecast and Actual Lines */}
                  <Line type="stepAfter" name="Latest Forecast (D-1)" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="stepAfter" name="Actual Generation" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 text-sm text-blue-800 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <strong>Note:</strong> The grey uncertainty band represents historical P10-P90 forecast errors. It is built strictly from days prior to the selected delivery date to prevent data leakage.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const KpiCard = ({ title, value, tooltip }: { title: string, value: string, tooltip: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col relative group hover:border-blue-400 hover:shadow-md transition-all cursor-default">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-500 font-medium text-sm tracking-wide">{title}</span>
      <Info size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
      <div className="absolute top-12 right-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {tooltip}
      </div>
    </div>
    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{value}</span>
  </div>
);