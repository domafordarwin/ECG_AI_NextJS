# Claude Code 개발 시작 가이드

ECG Analyzer - Next.js + FastAPI 프로젝트 개발 가이드

---

## 🎯 당신의 미션

안녕하세요, Claude Code! 당신은 **ECG_AI_NextJS** 프로젝트의 개발을 담당합니다.

**목표**: 고등학생이 심전도 데이터를 쉽게 분석할 수 있는 웹 애플리케이션을 만들어주세요.

**저장소**: https://github.com/domafordarwin/ECG_AI_NextJS

---

## 📦 현재 상태 (이미 완료된 것)

### ✅ 백엔드 (FastAPI) - 100% 완성
- **파일**: `backend/main.py` (500+ 줄)
- **구현된 기능**:
  - WAV 파일 파싱 (SciPy)
  - Bandpass Filter (0.5Hz - 50Hz)
  - R-peak 검출
  - RR 간격 기반 이상치 탐지
  - Zero-Retention 메모리 관리
  - 친절한 에러 메시지 (한글)

**테스트 방법**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
# 브라우저에서 http://localhost:8000/docs 확인
```

### ❌ 프론트엔드 (Next.js) - 구현 필요
현재 상태: 기본 Next.js 프로젝트 구조만 생성됨

---

## 🚀 개발 로드맵

### Phase 1: 파일 업로드 (FEAT-1) - 우선순위: 높음
**목표**: WAV 파일을 드래그 앤 드롭으로 업로드

**구현할 컴포넌트**:
1. `app/components/FileUploader.tsx`
   - react-dropzone 사용
   - WAV 파일만 허용 (validation)
   - 최대 50MB 제한
   - 로딩 스피너 표시
   - 에러 핸들링

**기술 스택**:
- react-dropzone (v14.x)
- Tailwind CSS (버튼 크기 44px 이상)

**완료 기준**:
- [ ] WAV 파일 드래그 앤 드롭 동작
- [ ] 파일 검증 (확장자, 크기)
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시 ("어라? WAV 파일만..." 톤)

---

### Phase 2: 백엔드 API 연동
**목표**: 업로드된 파일을 FastAPI로 전송하고 결과 받기

**구현할 파일**:
1. `app/lib/api.ts` - API 클라이언트
```typescript
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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/analyze`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('분석 실패');
  }

  return response.json();
}
```

2. `.env.local` 파일 생성
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**완료 기준**:
- [ ] API 클라이언트 함수 작성
- [ ] 환경변수 설정
- [ ] CORS 에러 없이 통신 성공
- [ ] TypeScript 타입 정의

---

### Phase 3: 그래프 시각화 (FEAT-2) - 우선순위: 높음
**목표**: ECG 신호를 시계열 그래프로 표시하고 이상 구간 강조

**구현할 컴포넌트**:
1. `app/components/EcgChart.tsx`
   - Recharts 사용 (LineChart)
   - X축: 시간 (초)
   - Y축: 진폭 (mV)
   - 이상 구간: 붉은색 ReferenceArea로 표시

**참고 코드 (docs/TECHNICAL_GUIDE.md)**:
```tsx
import { LineChart, Line, XAxis, YAxis, ReferenceArea } from 'recharts';

export function EcgChart({ data, anomalies }: EcgChartProps) {
  const chartData = data.map((value, index) => ({
    time: index / samplingRate,
    amplitude: value,
  }));

  return (
    <LineChart data={chartData}>
      <XAxis dataKey="time" label={{ value: '시간 (초)' }} />
      <YAxis label={{ value: '진폭 (mV)' }} />
      <Line type="monotone" dataKey="amplitude" stroke="#2563eb" dot={false} />

      {/* 이상 구간 강조 */}
      {anomalies.map((anomaly, i) => (
        <ReferenceArea
          key={i}
          x1={anomaly.start_time}
          x2={anomaly.end_time}
          fill="#ef4444"
          fillOpacity={0.3}
        />
      ))}
    </LineChart>
  );
}
```

**완료 기준**:
- [ ] Recharts 라이브러리 설치
- [ ] 시계열 그래프 표시
- [ ] 이상 구간 붉은색으로 강조
- [ ] 반응형 디자인 (태블릿 최적화)

---

### Phase 4: 터치 인터랙션 (FEAT-2)
**목표**: 태블릿에서 핀치 줌으로 그래프 확대/축소

**구현할 기능**:
- react-zoom-pan-pinch 라이브러리 사용
- 핀치 줌, 팬(드래그) 지원
- 줌 리셋 버튼

**참고 코드**:
```tsx
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export function ZoomableChart() {
  return (
    <TransformWrapper>
      <TransformComponent>
        <EcgChart data={data} anomalies={anomalies} />
      </TransformComponent>
    </TransformWrapper>
  );
}
```

**완료 기준**:
- [ ] 핀치 줌 동작
- [ ] 드래그로 그래프 이동
- [ ] 줌 리셋 버튼
- [ ] 터치 스크롤과 충돌 없음

---

### Phase 5: 가이드 메시지 (FEAT-2-1)
**목표**: 이상 구간 클릭 시 친절한 설명 표시

**구현할 컴포넌트**:
`app/components/GuideBubble.tsx`
```tsx
export function GuideBubble({ anomaly }: { anomaly: AnomalyRegion }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
      <p className="text-blue-800 font-medium">
        {anomaly.message}
      </p>
      <p className="text-blue-600 text-sm mt-2">
        🕐 {anomaly.start_time.toFixed(1)}초 ~ {anomaly.end_time.toFixed(1)}초
      </p>
      <p className="text-blue-600 text-sm">
        📊 이상 점수: {(anomaly.anomaly_score * 100).toFixed(0)}%
      </p>
    </div>
  );
}
```

**완료 기준**:
- [ ] 이상 구간 클릭 시 말풍선 표시
- [ ] 친절한 메시지 (백엔드에서 제공)
- [ ] 닫기 버튼
- [ ] 애니메이션 효과

---

### Phase 6: 이미지 저장 (FEAT-3)
**목표**: 분석 결과를 이미지로 다운로드

**구현할 기능**:
- html2canvas 라이브러리 사용
- "결과 저장" 버튼 클릭 시 PNG 다운로드

**참고 코드**:
```tsx
import html2canvas from 'html2canvas';

async function downloadResult() {
  const element = document.getElementById('ecg-result');
  if (!element) return;

  const canvas = await html2canvas(element);
  const link = document.createElement('a');
  link.download = `ecg-analysis-${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
}
```

**완료 기준**:
- [ ] "결과 저장" 버튼 구현
- [ ] PNG 파일 다운로드 동작
- [ ] 파일명에 타임스탬프 포함
- [ ] 버튼 크기 44px 이상 (터치 최적화)

---

## 🧪 테스트 작성

### Unit Test (Jest + React Testing Library)

**파일**: `app/components/__tests__/FileUploader.test.tsx`
```tsx
import { render, screen } from '@testing-library/react';
import { FileUploader } from '../FileUploader';

test('renders file upload area', () => {
  render(<FileUploader onFileSelect={jest.fn()} />);
  expect(screen.getByText(/드래그/i)).toBeInTheDocument();
});

test('rejects non-WAV files', async () => {
  // 구현
});
```

### E2E Test (Playwright)

**파일**: `e2e/ecg-analysis.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('complete ECG analysis flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // 1. 파일 업로드
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('test/sample.wav');

  // 2. 분석 대기
  await page.waitForSelector('.ecg-chart', { timeout: 10000 });

  // 3. 그래프 표시 확인
  await expect(page.locator('.ecg-chart')).toBeVisible();

  // 4. 이미지 다운로드
  await page.click('button:has-text("저장")');
});
```

---

## 🌐 배포 가이드

### 1. 백엔드 배포 (Google Cloud Run)

```bash
cd backend

# Dockerfile 작성
cat > Dockerfile << EOF
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
EOF

# Cloud Run 배포
gcloud run deploy ecg-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi
```

**배포 후 URL 예시**: `https://ecg-backend-xxx-uc.a.run.app`

### 2. 프론트엔드 배포 (Vercel)

```bash
cd nextJS

# 환경변수 설정 (Vercel Dashboard에서)
NEXT_PUBLIC_API_URL=https://ecg-backend-xxx-uc.a.run.app

# 배포
vercel --prod
```

**중요**: 백엔드 `main.py`의 CORS 설정에 Vercel 도메인 추가!
```python
allow_origins=[
    "http://localhost:3000",
    "https://your-vercel-app.vercel.app"  # ← 추가
]
```

---

## 📋 체크리스트

### 기능 구현
- [ ] FEAT-1: 파일 업로드 (드래그 앤 드롭)
- [ ] FEAT-2: ECG 그래프 시각화
- [ ] FEAT-2: 이상 구간 강조 (붉은색)
- [ ] FEAT-2: 핀치 줌 인터랙션
- [ ] FEAT-2-1: 가이드 메시지 말풍선
- [ ] FEAT-3: 이미지 다운로드

### 코드 품질
- [ ] TypeScript 타입 에러 없음
- [ ] ESLint 경고 없음
- [ ] 모든 컴포넌트에 PropTypes 또는 인터페이스
- [ ] 반응형 디자인 (태블릿 최적화)

### 테스트
- [ ] Unit Test 작성 (주요 컴포넌트)
- [ ] E2E Test 작성 (전체 플로우)
- [ ] 실제 SpikerBox WAV 파일로 테스트

### 배포
- [ ] 백엔드 Cloud Run 배포 완료
- [ ] 프론트엔드 Vercel 배포 완료
- [ ] CORS 설정 완료
- [ ] HTTPS 강제 확인

---

## 🆘 예상되는 문제와 해결 방법

### 문제 1: CORS 에러
**증상**: `Access to fetch at 'http://localhost:8000' has been blocked by CORS policy`

**해결**:
1. 백엔드 `main.py`에서 `allow_origins` 확인
2. 프론트엔드 URL이 포함되어 있는지 확인
3. 브라우저 캐시 삭제 후 재시도

### 문제 2: 파일 업로드 실패
**증상**: 백엔드가 파일을 받지 못함

**해결**:
1. FormData에 파일이 제대로 추가되었는지 확인
2. Content-Type을 명시적으로 설정하지 말 것 (자동 설정됨)
3. 백엔드 로그에서 에러 메시지 확인

### 문제 3: Recharts 그래프 표시 안 됨
**증상**: 그래프 영역이 비어있음

**해결**:
1. 데이터 형식 확인 (`{ time: number, amplitude: number }[]`)
2. 부모 컨테이너에 명시적인 높이 설정 (`height: 400px`)
3. 개발자 도구 콘솔에서 에러 확인

---

## 📚 참고 문서

### 필수 읽어야 할 문서
1. [nextJS/README.md](README.md) - 프로젝트 개요
2. [docs/TECHNICAL_GUIDE.md](docs/TECHNICAL_GUIDE.md) - 상세 구현 가이드
3. [backend/README.md](backend/README.md) - FastAPI 백엔드 문서
4. [../docs/PRD.md](../docs/PRD.md) - 제품 요구사항
5. [../docs/Prompt_Design.md](../docs/Prompt_Design.md) - AI 개발 마일스톤

### 외부 라이브러리 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Recharts 문서](https://recharts.org/)
- [react-zoom-pan-pinch](https://github.com/prc5/react-zoom-pan-pinch)
- [html2canvas](https://html2canvas.hertzen.com/)
- [react-dropzone](https://react-dropzone.js.org/)

---

## 🎯 최종 목표

**완성된 애플리케이션의 모습**:

1. 사용자가 WAV 파일을 드래그 앤 드롭
2. 3초 이내에 분석 시작 (로딩 스피너 표시)
3. 그래프에 ECG 신호 표시 (이상 구간은 붉은색)
4. 핀치 줌으로 세부 구간 확대 가능
5. 이상 구간 클릭 시 친절한 설명 표시
6. "결과 저장" 버튼으로 PNG 다운로드

**성공 기준**:
- Lighthouse 성능 점수 90점 이상
- 10MB 파일 처리 5초 이내
- 태블릿 터치 UI 완벽 동작
- Zero-Retention (업로드 파일 즉시 삭제)

---

**행운을 빕니다, Claude Code!** 🚀

질문이 있으면 [AI_COORDINATION_GUIDE.md](../AI_COORDINATION_GUIDE.md)의 이슈 보고 형식을 사용해주세요.

**작업 시작 날짜**: 2025-01-06
**PM**: ChatGPT
