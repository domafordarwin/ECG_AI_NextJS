# FastAPI Backend for ECG Analyzer

Python FastAPI 기반 심전도 분석 백엔드입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
# Python 가상환경 생성 (권장)
python -m venv venv

# 가상환경 활성화
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt
```

### 2. 개발 서버 실행

```bash
uvicorn main:app --reload --port 8000
```

브라우저에서 확인:
- API 문서: http://localhost:8000/docs
- 헬스체크: http://localhost:8000/api/health

## 📚 API 엔드포인트

### POST /api/analyze

WAV 파일을 업로드하여 ECG 분석 수행

**Request:**
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@sample.wav"
```

**Response:**
```json
{
  "success": true,
  "sampling_rate": 10000,
  "duration": 30.5,
  "data_points": [...],
  "anomalies": [
    {
      "start_time": 5.2,
      "end_time": 6.1,
      "anomaly_score": 0.85,
      "message": "이 구간은 85% 확률로 불규칙해요!"
    }
  ]
}
```

## 🧪 테스트

```bash
# pytest 설치
pip install pytest pytest-asyncio httpx

# 테스트 실행
pytest test_main.py
```

## 🌐 배포

### Google Cloud Run

```bash
# Dockerfile 빌드
gcloud builds submit --tag gcr.io/PROJECT_ID/ecg-backend

# Cloud Run 배포
gcloud run deploy ecg-backend \
  --image gcr.io/PROJECT_ID/ecg-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 30s
```

### AWS Lambda (Mangum 사용)

```bash
# Mangum 설치
pip install mangum

# main.py에 추가:
# from mangum import Mangum
# handler = Mangum(app)
```

## 📖 자세한 내용

전체 기술 문서는 [../docs/TECHNICAL_GUIDE.md](../docs/TECHNICAL_GUIDE.md) 참고
