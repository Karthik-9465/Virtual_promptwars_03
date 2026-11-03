import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export function CarbonHistoryBarChart({ footprints }) {
  const trendData = footprints.map((record) => {
    const monthName = new Date(record.recordedMonth).toLocaleString('default', { month: 'short' });
    return {
      month: monthName,
      Transport: record.transportEmissions,
      Energy: record.energyEmissions,
      Food: record.foodEmissions,
      Shopping: record.shoppingEmissions,
      Waste: record.wasteEmissions,
      Total: record.totalEmissions,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trendData}>
          <XAxis dataKey="month" stroke="#4b5563" fontSize={11} tickLine={false} />
          <YAxis stroke="#4b5563" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: '#1f2937',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, pt: 10 }} />
          <Bar dataKey="Transport" stackId="a" fill="#10b981" />
          <Bar dataKey="Energy" stackId="a" fill="#3b82f6" />
          <Bar dataKey="Food" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Shopping" stackId="a" fill="#ec4899" />
          <Bar dataKey="Waste" stackId="a" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CarbonContributionPieChart({ latestFootprint }) {
  const pieData = latestFootprint
    ? [
        { name: 'Transport', value: latestFootprint.transportEmissions },
        { name: 'Home Energy', value: latestFootprint.energyEmissions },
        { name: 'Food', value: latestFootprint.foodEmissions },
        { name: 'Shopping', value: latestFootprint.shoppingEmissions },
        { name: 'Waste', value: latestFootprint.wasteEmissions },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="flex flex-col justify-between h-full w-full">
      {pieData.length > 0 ? (
        <div className="h-44 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#1f2937',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{latestFootprint?.totalEmissions}</span>
            <span className="text-[10px] text-gray-500">Total kg</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 text-xs">No footprint data to display. Please run calculator.</div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-900/50 mt-2">
        {pieData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
            <span className="text-gray-400 truncate">{item.name} ({Math.round(item.value)} kg)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
