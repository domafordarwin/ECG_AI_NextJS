'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { EcgChart } from './EcgChart';
import { AnomalyRegion } from '../lib/api';

interface ZoomableChartProps {
  dataPoints: number[];
  samplingRate: number;
  anomalies: AnomalyRegion[];
  onAnomalyClick?: (anomaly: AnomalyRegion) => void;
}

export function ZoomableChart({
  dataPoints,
  samplingRate,
  anomalies,
  onAnomalyClick,
}: ZoomableChartProps) {
  return (
    <div className="w-full">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <div className="space-y-4">
            {/* Zoom controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => zoomIn()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md min-w-[120px] min-h-[44px]"
                aria-label="확대"
              >
                🔍 확대
              </button>
              <button
                onClick={() => zoomOut()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md min-w-[120px] min-h-[44px]"
                aria-label="축소"
              >
                🔍 축소
              </button>
              <button
                onClick={() => resetTransform()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md min-w-[120px] min-h-[44px]"
                aria-label="초기화"
              >
                ↺ 초기화
              </button>
            </div>

            {/* Chart */}
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-lg">
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <EcgChart
                  dataPoints={dataPoints}
                  samplingRate={samplingRate}
                  anomalies={anomalies}
                  onAnomalyClick={onAnomalyClick}
                />
              </TransformComponent>
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-gray-600">
              <p>💡 마우스 휠 또는 핀치로 확대/축소할 수 있어요</p>
              <p className="mt-1">드래그해서 그래프를 이동할 수 있어요</p>
            </div>
          </div>
        )}
      </TransformWrapper>
    </div>
  );
}
