// API Client for ECG Analyzer

export interface AnomalyRegion {
  start_time: number;
  end_time: number;
  anomaly_score: number;
  message: string;
}

export interface AnalysisResult {
  success: boolean;
  sampling_rate: number;
  duration: number;
  data_points: number[];
  anomalies: AnomalyRegion[];
}

export async function analyzeWav(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const response = await fetch(`${apiUrl}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '분석 실패' }));
    throw new Error(error.error || '분석 중 오류가 발생했어요!');
  }

  return response.json();
}
