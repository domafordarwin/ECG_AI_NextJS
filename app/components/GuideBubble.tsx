'use client';

import { AnomalyRegion } from '../lib/api';

interface GuideBubbleProps {
  anomaly: AnomalyRegion;
  onClose: () => void;
}

export function GuideBubble({ anomaly, onClose }: GuideBubbleProps) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg shadow-lg relative animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
        aria-label="닫기"
      >
        ×
      </button>

      <div className="space-y-3">
        <div className="pr-8">
          <p className="text-blue-900 font-semibold text-lg">{anomaly.message}</p>
        </div>

        <div className="flex flex-col gap-2 text-blue-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕐</span>
            <span className="text-sm font-medium">
              {anomaly.start_time.toFixed(2)}초 ~ {anomaly.end_time.toFixed(2)}초
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <span className="text-sm font-medium">
              이상 점수: {(anomaly.anomaly_score * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <span className="text-sm">
              심장 박동이 평균보다 불규칙한 구간이에요
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
