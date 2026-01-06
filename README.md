# ECG Analyzer - Next.js + FastAPI 풀스택 프로젝트

Backyard Brains SpikerBox 심전도 분석 웹 애플리케이션 (교육용)

## 🎯 프로젝트 개요

이 프로젝트는 **프론트엔드(Next.js)**와 **백엔드(FastAPI)**가 통합된 풀스택 구조입니다.
고등학생이 심전도 실험 데이터를 쉽게 분석할 수 있도록 설계되었습니다.

## 📁 프로젝트 구조

```
nextJS/
├── app/                    # Next.js 프론트엔드 (App Router)
│   ├── page.tsx           # 메인 페이지 (파일 업로드)
│   ├── result/            # 분석 결과 페이지
│   ├── components/        # React 컴포넌트
│   └── lib/               # 유틸리티 (API Client 등)
├── backend/               # Python FastAPI 백엔드 ⭐ NEW
│   ├── main.py           # FastAPI 메인 파일
│   ├── requirements.txt  # Python 의존성
│   └── README.md         # 백엔드 상세 문서
├── docs/                  # 기술 문서
│   └── TECHNICAL_GUIDE.md
├── public/               # 정적 파일
└── package.json
```

## 🚀 빠른 시작 (Quick Start)

### 사전 요구사항
- **Node.js** (LTS 권장)
- **Python 3.11+**

### 1️⃣ 프론트엔드 실행 (Next.js)

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 2️⃣ 백엔드 실행 (FastAPI)

**새 터미널을 열어서 실행:**

```bash
# backend 폴더로 이동
cd backend

# Python 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행 (포트 8000)
uvicorn main:app --reload
```

FastAPI API 문서: http://localhost:8000/docs

### 3️⃣ 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 기술 스택

### Frontend
- **Next.js 16.1.1** (App Router)
- **React 19.2.3** + TypeScript
- **Tailwind CSS 4**
- **Recharts** (그래프 시각화)
- **react-zoom-pan-pinch** (핀치 줌)
- **html2canvas** (스크린샷)
- **react-dropzone** (파일 업로드)

### Backend
- **Python 3.11+**
- **FastAPI** (웹 프레임워크)
- **NumPy** (데이터 처리)
- **SciPy** (신호 처리, WAV 파싱)
- **Uvicorn** (ASGI 서버)

## 🎓 학습 목표

이 풀스택 프로젝트로 다음을 학습할 수 있습니다:

### 프론트엔드 (Next.js)
- ✅ App Router 기반 라우팅
- ✅ 파일 업로드 UI/UX (드래그 앤 드롭)
- ✅ 차트 라이브러리 활용 (Recharts)
- ✅ 터치 인터랙션 구현 (핀치 줌)
- ✅ 백엔드 API 연동

### 백엔드 (FastAPI)
- ✅ RESTful API 설계
- ✅ 파일 업로드 처리 (Multipart)
- ✅ WAV 파일 파싱 (SciPy)
- ✅ 신호 처리 (Bandpass Filter)
- ✅ 이상치 탐지 알고리즘 (R-peak, RR 간격)
- ✅ CORS 설정 (프론트-백 연동)

### 풀스택 통합
- ✅ 프론트-백 API 연동
- ✅ 환경변수 관리
- ✅ Zero-Retention 아키텍처 구현
- ✅ 배포 (Vercel + Cloud Run)

## 📚 상세 문서

- **[프론트엔드 기술 가이드](docs/TECHNICAL_GUIDE.md)** - Next.js 구현 상세
- **[백엔드 API 문서](backend/README.md)** - FastAPI 구현 상세
- **[프로젝트 요구사항 (PRD)](../docs/PRD.md)** - 제품 정의
- **[기술 요구사항 (TRD)](../docs/TRD.md)** - 기술 스펙

## 🧪 테스트

### 프론트엔드 테스트
```bash
npm run lint
npm test  # Jest + React Testing Library (추가 예정)
```

### 백엔드 테스트
```bash
cd backend
pytest  # 테스트 코드 작성 후
```

## 🌐 배포

### 프론트엔드 (Vercel)
```bash
vercel --prod
```

### 백엔드 (Google Cloud Run)
```bash
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/ecg-backend
gcloud run deploy ecg-backend \
  --image gcr.io/PROJECT_ID/ecg-backend \
  --platform managed \
  --allow-unauthenticated
```

배포 후 Vercel 환경변수를 Cloud Run URL로 업데이트:
```
NEXT_PUBLIC_API_URL=https://ecg-backend-xxx.run.app
```

## 🆘 문제 해결

### CORS 오류
- 백엔드 `main.py`의 `allow_origins`에 프론트엔드 URL 추가 확인
- 브라우저 콘솔에서 정확한 오류 메시지 확인

### 파일 업로드 실패
- 파일 크기 50MB 이하 확인
- WAV 파일 포맷 확인 (PCM, Mono, 10kHz)
- 백엔드 서버 실행 여부 확인 (http://localhost:8000/api/health)

### Python 가상환경 오류
```bash
# 가상환경 삭제 후 재생성
rm -rf venv
python -m venv venv
```

## 📞 참고 링크

- [Next.js 공식 문서](https://nextjs.org/docs)
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [SciPy Signal Processing](https://docs.scipy.org/doc/scipy/reference/signal.html)
- [Backyard Brains SpikerBox](https://backyardbrains.com/)

