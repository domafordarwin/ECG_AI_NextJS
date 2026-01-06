"""
FastAPI Backend for ECG Analysis
Backyard Brains SpikerBox WAV File Analyzer

개발 서버 실행:
    uvicorn main:app --reload --port 8000

필수 패키지 설치:
    pip install -r requirements.txt
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from scipy.io import wavfile
from scipy import signal
import io
import gc
from typing import List, Dict
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ECG Analyzer API",
    description="SpikerBox WAV 파일 분석 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js 개발 서버
        "http://localhost:3001",
        "https://*.vercel.app",   # Vercel 배포 (프로덕션)
    ],
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# 상수 설정
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
EXPECTED_SAMPLE_RATE = 10000  # SpikerBox 표준
EXPECTED_CHANNELS = 1  # Mono


@app.get("/")
def health_check():
    """헬스체크 엔드포인트"""
    return {"status": "OK", "service": "ECG Analyzer API"}


@app.get("/api/health")
def api_health():
    """API 헬스체크"""
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/api/analyze")
async def analyze_ecg(file: UploadFile = File(...)):
    """
    WAV 파일 분석 메인 엔드포인트

    Parameters:
        file: WAV 파일 (Mono, 10kHz, 16-bit PCM)

    Returns:
        JSON: {
            success: bool,
            sampling_rate: int,
            duration: float,
            data_points: List[float],
            anomalies: List[Dict]
        }
    """
    try:
        # 1. 파일 유효성 검사
        if not file.filename.endswith('.wav'):
            raise HTTPException(
                status_code=400,
                detail="WAV 파일만 올릴 수 있어요! 🎵"
            )

        # 파일 읽기 (메모리에서만 처리)
        contents = await file.read()

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="파일 크기가 너무 커요! 50MB 이하로 올려주세요."
            )

        # 2. WAV 파일 파싱
        wav_data = parse_wav_file(contents)

        # 3. 신호 처리 (노이즈 필터링)
        filtered_data = apply_bandpass_filter(wav_data)

        # 4. 이상치 탐지
        anomalies = detect_anomalies(filtered_data, wav_data['sampling_rate'])

        # 5. 응답 데이터 준비
        # 프론트엔드 부하 방지를 위해 데이터 포인트 다운샘플링
        downsampled_data = downsample_data(filtered_data, target_points=2000)

        result = {
            "success": True,
            "sampling_rate": wav_data['sampling_rate'],
            "duration": wav_data['duration'],
            "data_points": downsampled_data.tolist(),
            "anomalies": anomalies
        }

        logger.info(f"분석 완료: {file.filename}, 이상치 {len(anomalies)}개 발견")

        return JSONResponse(content=result)

    except HTTPException as e:
        raise e

    except Exception as e:
        logger.error(f"분석 중 오류: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="분석 중 문제가 발생했어요. 다시 시도해주세요! 🤔"
        )

    finally:
        # 메모리 즉시 해제 (Zero-Retention)
        del contents
        gc.collect()


def parse_wav_file(contents: bytes) -> Dict:
    """
    WAV 파일 파싱

    Args:
        contents: WAV 파일 바이트 데이터

    Returns:
        Dict: {
            'sampling_rate': int,
            'duration': float,
            'data': np.ndarray
        }
    """
    try:
        # BytesIO로 메모리에서 처리
        audio_stream = io.BytesIO(contents)
        sampling_rate, data = wavfile.read(audio_stream)

        # 검증: 샘플링 레이트
        if sampling_rate != EXPECTED_SAMPLE_RATE:
            logger.warning(f"샘플링 레이트 불일치: {sampling_rate}Hz (예상: {EXPECTED_SAMPLE_RATE}Hz)")

        # 검증: 채널 수 (Mono)
        if len(data.shape) > 1:
            # Stereo인 경우 첫 번째 채널만 사용
            data = data[:, 0]
            logger.warning("Stereo 파일 감지, 첫 번째 채널 사용")

        # 정규화 (-1.0 ~ 1.0)
        if data.dtype == np.int16:
            data = data.astype(np.float32) / 32768.0

        duration = len(data) / sampling_rate

        return {
            'sampling_rate': sampling_rate,
            'duration': duration,
            'data': data
        }

    except Exception as e:
        raise ValueError(f"WAV 파일 파싱 실패: {str(e)}")


def apply_bandpass_filter(wav_data: Dict) -> np.ndarray:
    """
    Bandpass Filter 적용 (노이즈 제거)
    ECG 신호: 0.5Hz ~ 50Hz

    Args:
        wav_data: parse_wav_file 반환값

    Returns:
        np.ndarray: 필터링된 데이터
    """
    data = wav_data['data']
    sampling_rate = wav_data['sampling_rate']

    # Bandpass Filter 설계
    nyquist = sampling_rate / 2
    low_freq = 0.5 / nyquist
    high_freq = 50.0 / nyquist

    # Butterworth 필터 (4차)
    b, a = signal.butter(4, [low_freq, high_freq], btype='band')

    # Zero-phase 필터링 (filtfilt)
    filtered_data = signal.filtfilt(b, a, data)

    return filtered_data


def detect_anomalies(filtered_data: np.ndarray, sampling_rate: int) -> List[Dict]:
    """
    이상치 탐지 (Rule-based Algorithm)
    R-peak 검출 후 RR 간격 분석

    Args:
        filtered_data: 필터링된 ECG 데이터
        sampling_rate: 샘플링 레이트

    Returns:
        List[Dict]: [
            {
                "start_time": float,
                "end_time": float,
                "anomaly_score": float,
                "message": str
            }
        ]
    """
    # 1. R-peak 검출
    # find_peaks: 높이와 거리 기준으로 피크 찾기
    threshold = np.max(filtered_data) * 0.6
    min_distance = int(sampling_rate * 0.3)  # 최소 0.3초 간격 (심박수 200bpm 이하)

    peaks, _ = signal.find_peaks(
        filtered_data,
        height=threshold,
        distance=min_distance
    )

    if len(peaks) < 2:
        # 피크가 2개 미만이면 이상치 탐지 불가
        return []

    # 2. RR 간격 계산 (초 단위)
    rr_intervals = np.diff(peaks) / sampling_rate

    # 3. 통계 분석
    mean_rr = np.mean(rr_intervals)
    std_rr = np.std(rr_intervals)

    # 4. 이상치 탐지 (평균에서 2 표준편차 이상 벗어난 구간)
    anomalies = []

    for i, rr in enumerate(rr_intervals):
        deviation = abs(rr - mean_rr)

        if deviation > 2 * std_rr:
            # 이상 구간 발견
            start_idx = peaks[i]
            end_idx = peaks[i + 1]

            start_time = start_idx / sampling_rate
            end_time = end_idx / sampling_rate

            # Anomaly Score 계산 (0-1 정규화)
            score = min(deviation / (3 * std_rr), 1.0)

            anomalies.append({
                "start_time": round(start_time, 2),
                "end_time": round(end_time, 2),
                "anomaly_score": round(score, 2),
                "message": generate_friendly_message(score)
            })

    return anomalies


def generate_friendly_message(score: float) -> str:
    """
    친절한 가이드 메시지 생성

    Args:
        score: 이상치 점수 (0-1)

    Returns:
        str: 사용자 친화적 메시지
    """
    if score >= 0.8:
        return f"이 구간은 {int(score * 100)}% 확률로 불규칙해요!"
    elif score >= 0.5:
        return "이 구간은 조금 이상한 패턴이 보여요."
    else:
        return "미세한 변동이 감지되었어요."


def downsample_data(data: np.ndarray, target_points: int = 2000) -> np.ndarray:
    """
    데이터 다운샘플링 (프론트엔드 부하 감소)

    Args:
        data: 원본 데이터
        target_points: 목표 포인트 수

    Returns:
        np.ndarray: 다운샘플링된 데이터
    """
    if len(data) <= target_points:
        return data

    # 균등 간격으로 샘플링
    indices = np.linspace(0, len(data) - 1, target_points, dtype=int)
    return data[indices]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
