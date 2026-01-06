'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { AnomalyRegion } from '../lib/api';

interface EcgChartProps {
  dataPoints: number[];
  samplingRate: number;
  anomalies: AnomalyRegion[];
  onAnomalyClick?: (anomaly: AnomalyRegion) => void;
}

// Custom tooltip component - defined outside of render
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { time: number; amplitude: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded p-2 shadow-lg">
        <p className="text-sm">
          <span className="font-medium">시간:</span> {data.time.toFixed(2)}초
        </p>
        <p className="text-sm">
          <span className="font-medium">진폭:</span> {payload[0].value.toFixed(4)} mV
        </p>
      </div>
    );
  }
  return null;
}

export function EcgChart({ dataPoints, samplingRate, anomalies, onAnomalyClick }: EcgChartProps) {
  // Convert data points to chart format
  const chartData = dataPoints.map((value, index) => ({
    time: Number((index / samplingRate).toFixed(3)),
    amplitude: value,
  }));

  return (
    <div className="w-full" style={{ height: '500px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="time"
            label={{
              value: '시간 (초)',
              position: 'insideBottom',
              offset: -10,
              style: { fontSize: '14px', fontWeight: 'bold' },
            }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{
              value: '진폭 (mV)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '14px', fontWeight: 'bold' },
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Anomaly regions - highlighted in red */}
          {anomalies.map((anomaly, index) => (
            <ReferenceArea
              key={index}
              x1={anomaly.start_time}
              x2={anomaly.end_time}
              fill="#ef4444"
              fillOpacity={0.3}
              stroke="#dc2626"
              strokeWidth={2}
              strokeOpacity={0.5}
              onClick={() => onAnomalyClick?.(anomaly)}
              style={{ cursor: onAnomalyClick ? 'pointer' : 'default' }}
            />
          ))}

          {/* ECG signal line */}
          <Line
            type="monotone"
            dataKey="amplitude"
            stroke="#2563eb"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-600"></div>
          <span className="text-gray-700">ECG 신호</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-4 bg-red-500 opacity-30 border-2 border-red-600"></div>
          <span className="text-gray-700">이상 구간</span>
        </div>
      </div>
    </div>
  );
}
