'use client';

import { useState, useRef } from 'react';
import { FileUploader } from './components/FileUploader';
import { ZoomableChart } from './components/ZoomableChart';
import { GuideBubble } from './components/GuideBubble';
import { analyzeWav, AnalysisResult, AnomalyRegion } from './lib/api';
import html2canvas from 'html2canvas';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRegion | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedAnomaly(null);

    try {
      const analysisResult = await analyzeWav(file);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '분석 중 오류가 발생했어요! 🔧';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnomalyClick = (anomaly: AnomalyRegion) => {
    setSelectedAnomaly(anomaly);
  };

  const handleDownloadResult = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `ecg-analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('이미지 저장에 실패했어요! 다시 시도해주세요.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ECG Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Backyard Brains SpikerBox 심전도 분석 도구
          </p>
          <p className="text-sm text-gray-500 mt-2">
            고등학생 과학 실험을 위한 웹 애플리케이션
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-12">
          <FileUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <p className="text-red-800 font-semibold text-lg">오류가 발생했어요</p>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <div ref={resultRef} id="ecg-result" className="space-y-8">
            {/* Stats Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 분석 결과</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">샘플링 레이트</p>
                  <p className="text-3xl font-bold text-blue-900">{result.sampling_rate} Hz</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">측정 시간</p>
                  <p className="text-3xl font-bold text-green-900">{result.duration.toFixed(1)} 초</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium mb-1">이상 구간</p>
                  <p className="text-3xl font-bold text-purple-900">{result.anomalies.length} 개</p>
                </div>
              </div>
            </div>

            {/* Selected Anomaly Guide */}
            {selectedAnomaly && (
              <div className="max-w-2xl mx-auto">
                <GuideBubble
                  anomaly={selectedAnomaly}
                  onClose={() => setSelectedAnomaly(null)}
                />
              </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📈 ECG 신호 그래프</h2>
                <button
                  onClick={handleDownloadResult}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md min-h-[44px] flex items-center gap-2"
                >
                  💾 결과 저장
                </button>
              </div>

              <ZoomableChart
                dataPoints={result.data_points}
                samplingRate={result.sampling_rate}
                anomalies={result.anomalies}
                onAnomalyClick={handleAnomalyClick}
              />
            </div>

            {/* Anomalies List */}
            {result.anomalies.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 발견된 이상 구간</h2>
                <div className="space-y-4">
                  {result.anomalies.map((anomaly, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnomalyClick(anomaly)}
                      className="w-full text-left bg-red-50 border-l-4 border-red-500 p-6 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-red-900 font-semibold text-lg mb-2">
                            구간 #{index + 1}: {anomaly.message}
                          </p>
                          <div className="flex gap-6 text-sm text-red-700">
                            <span>
                              🕐 {anomaly.start_time.toFixed(2)}초 ~ {anomaly.end_time.toFixed(2)}초
                            </span>
                            <span>
                              📊 이상 점수: {(anomaly.anomaly_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl">👆</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {result.anomalies.length === 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-8 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">✅</span>
                  <div>
                    <p className="text-green-900 font-semibold text-xl">정상 심전도예요!</p>
                    <p className="text-green-700 mt-1">
                      이상 구간이 발견되지 않았어요. 심장 박동이 규칙적이에요!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-600">
          <p>고등학생 과학 실험용 교육 도구</p>
          <p className="mt-1">
            💡 데이터는 서버에 저장되지 않아요 (Zero-Retention 아키텍처)
          </p>
        </footer>
      </div>
    </main>
  );
}
