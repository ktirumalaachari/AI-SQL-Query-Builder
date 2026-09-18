import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Sliders } from 'lucide-react';
import type { QueryResult } from '../types';

interface ChartVisualizationProps {
  result: QueryResult;
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

export const ChartVisualization: React.FC<ChartVisualizationProps> = ({ result }) => {
  if (!result.columns || result.columns.length < 2 || result.rows.length === 0) {
    return null;
  }

  // Detect candidate X (category) and Y (numeric) columns
  const firstRow = result.rows[0];
  let defaultXIdx = 0;
  let defaultYIdx = 1;

  result.rows[0].forEach((val, idx) => {
    if (typeof val === 'number') {
      defaultYIdx = idx;
    } else if (typeof val === 'string') {
      defaultXIdx = idx;
    }
  });

  const chartSuggestion = result.chartSuggestion;
  if (chartSuggestion) {
    const xIdx = result.columns.indexOf(chartSuggestion.xAxisColumn);
    const yIdx = result.columns.indexOf(chartSuggestion.yAxisColumn);
    if (xIdx !== -1) defaultXIdx = xIdx;
    if (yIdx !== -1) defaultYIdx = yIdx;
  }

  const [xAxisIdx, setXAxisIdx] = useState(defaultXIdx);
  const [yAxisIdx, setYAxisIdx] = useState(defaultYIdx);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>(
    chartSuggestion?.type || 'bar'
  );

  // Map rows to recharts objects
  const chartData = result.rows.map((row, idx) => {
    const xVal = row[xAxisIdx] !== null && row[xAxisIdx] !== undefined ? String(row[xAxisIdx]) : `Row ${idx + 1}`;
    const rawY = row[yAxisIdx];
    const yVal = typeof rawY === 'number' ? rawY : parseFloat(String(rawY || 0)) || 0;

    return {
      name: xVal,
      value: yVal
    };
  }).slice(0, 30); // Limit to 30 items for clean rendering

  const xColName = result.columns[xAxisIdx] || 'Category';
  const yColName = result.columns[yAxisIdx] || 'Metric';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm mb-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {chartSuggestion?.title || `${yColName} by ${xColName}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive Data Visualization
            </p>
          </div>
        </div>

        {/* Chart Switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              chartType === 'bar'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Bar</span>
          </button>

          <button
            onClick={() => setChartType('pie')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              chartType === 'pie'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Pie Chart"
          >
            <PieIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Pie</span>
          </button>

          <button
            onClick={() => setChartType('line')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              chartType === 'line'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Line Chart"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Line</span>
          </button>
        </div>

      </div>

      {/* Axis Selectors */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span className="font-semibold">X-Axis (Category):</span>
          <select
            value={xAxisIdx}
            onChange={(e) => setXAxisIdx(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {result.columns.map((col, idx) => (
              <option key={col} value={idx}>{col}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold">Y-Axis (Value):</span>
          <select
            value={yAxisIdx}
            onChange={(e) => setYAxisIdx(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            {result.columns.map((col, idx) => (
              <option key={col} value={idx}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
              />
              <Bar dataKey="value" name={yColName} fill="#6366f1" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={yColName}
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
