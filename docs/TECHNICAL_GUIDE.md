# Next.js Frontend - 핵심 기술 가이드

## 📋 프로젝트 개요

Backyard Brains SpikerBox 심전도 분석 웹 애플리케이션의 프론트엔드 구현 가이드입니다.

## 🎯 핵심 목표

- 로그인 없이 10초 안에 분석 시작 가능한 UX
- 태블릿 터치 최적화 (핀치 줌, 44px 이상 터치 타겟)
- 친절한 UI/UX (고등학생 대상)
- 분석 결과 이미지 저장 기능

## 🛠️ 기술 스택

### Core Framework
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript 5.x**
- **Tailwind CSS 3.x**

### 필수 라이브러리

#### 1. 파일 업로드
```bash
npm install react-dropzone
```
- **용도**: WAV 파일 드래그 앤 드롭 UI
- **구현 위치**: `app/components/FileUploader.tsx`
- **주요 설정**:
  ```typescript
  accept: { 'audio/wav': ['.wav'] }
  maxSize: 52428800 // 50MB
  ```

#### 2. 차트 시각화
```bash
npm install recharts
```
- **용도**: 시계열 심전도 그래프 렌더링
- **구현 위치**: `app/components/EcgChart.tsx`
- **주요 컴포넌트**:
  - `LineChart`: 메인 그래프
  - `ReferenceArea`: 이상 구간 붉은색 표시

#### 3. 터치 인터랙션
```bash
npm install react-zoom-pan-pinch
```
- **용도**: 태블릿 핀치 줌/팬 기능
- **구현 위치**: `app/components/EcgChart.tsx`
- **주요 설정**:
  ```typescript
  <TransformWrapper
    minScale={1}
    maxScale={10}
    limitToBounds={true}
  >
    <TransformComponent>
      {/* Recharts Graph */}
    </TransformComponent>
  </TransformWrapper>
  ```

#### 4. 스크린샷
```bash
npm install html2canvas
```
- **용도**: 분석 결과 이미지 다운로드
- **구현 위치**: `app/components/ExportButton.tsx`
- **사용 예시**:
  ```typescript
  import html2canvas from 'html2canvas';

  const handleExport = async () => {
    const element = document.getElementById('result-container');
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = 'ecg-analysis.png';
    link.href = canvas.toDataURL();
    link.click();
  };
  ```

## 📁 프로젝트 구조

```
nextJS/
├── app/
│   ├── page.tsx                    # 메인 페이지 (업로드 화면)
│   ├── result/
│   │   └── page.tsx               # 분석 결과 화면
│   ├── components/
│   │   ├── FileUploader.tsx       # 파일 업로드 컴포넌트
│   │   ├── EcgChart.tsx           # 그래프 시각화 컴포넌트
│   │   ├── AnomalyHighlight.tsx   # 이상 구간 하이라이트
│   │   ├── GuideBubble.tsx        # 친절한 가이드 메시지
│   │   └── ExportButton.tsx       # 이미지 저장 버튼
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts           # Backend API 프록시 (선택사항)
│   ├── lib/
│   │   ├── apiClient.ts           # FastAPI 호출 유틸리티
│   │   └── types.ts               # TypeScript 타입 정의
│   ├── globals.css
│   └── layout.tsx
├── public/
│   └── sample.wav                 # 테스트용 샘플 파일
└── docs/
    └── TECHNICAL_GUIDE.md         # 본 문서
```

## 🎨 디자인 시스템

### 컬러 팔레트 (Tailwind 설정)

`tailwind.config.ts`에 다음 색상 추가:

```typescript
theme: {
  extend: {
    colors: {
      'medical-blue': '#0052CC',
      'soft-guide': '#E3F2FD',
      'alert-red': '#FF3B30',
      'safe-green': '#34C759',
    }
  }
}
```

### 타이포그래피

```css
/* globals.css */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### UI 컴포넌트 가이드

#### 1. 업로드 존 (FileUploader.tsx)
```typescript
<div className="border-2 border-dashed border-medical-blue rounded-lg p-12 text-center">
  <p className="text-xl text-gray-600">여기에 파일을 툭 놓으세요 📂</p>
</div>
```

#### 2. 액션 버튼
```typescript
<button className="bg-medical-blue text-white px-6 py-3 rounded-lg
                   min-h-[44px] text-lg font-medium hover:bg-blue-700">
  분석 시작하기
</button>
```

#### 3. 에러 메시지 (친절한 톤)
```typescript
{error && (
  <div className="bg-soft-guide border-l-4 border-alert-red p-4 rounded">
    <p className="text-gray-800">
      어라? 파일이 조금 손상된 것 같아요. 다시 녹음해서 올려주시겠어요? 🤔
    </p>
  </div>
)}
```

## 🔌 Backend API 연동

### API Client 설정 (lib/apiClient.ts)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeWavFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('분석 중 문제가 발생했어요');
  }

  return response.json();
}
```

### 타입 정의 (lib/types.ts)

```typescript
export interface AnomalyRegion {
  start_time: number;      // 초 단위
  end_time: number;
  anomaly_score: number;   // 0-1 사이
  message: string;         // "이 구간은 박동이 조금 불규칙해요!"
}

export interface AnalysisResult {
  sampling_rate: number;   // 10000 Hz
  duration: number;        // 초 단위
  data_points: number[];   // 시계열 데이터
  anomalies: AnomalyRegion[];
  success: boolean;
}
```

## 📱 모바일/태블릿 최적화

### 1. Viewport 설정 (layout.tsx)

```typescript
export const metadata = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
};
```

### 2. 터치 타겟 최소 크기

```css
/* 모든 버튼과 클릭 가능한 요소 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}
```

### 3. 핀치 줌 구현 (EcgChart.tsx)

```typescript
'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { LineChart, Line, XAxis, YAxis, ReferenceArea } from 'recharts';

export default function EcgChart({ data, anomalies }: Props) {
  return (
    <TransformWrapper
      initialScale={1}
      minScale={1}
      maxScale={10}
      limitToBounds={true}
      centerOnInit={true}
    >
      <TransformComponent>
        <LineChart width={800} height={400} data={data}>
          <XAxis dataKey="time" label="시간 (초)" />
          <YAxis label="전압 (mV)" />
          <Line type="monotone" dataKey="voltage" stroke="#0052CC" dot={false} />

          {/* 이상 구간 하이라이트 */}
          {anomalies.map((anomaly, idx) => (
            <ReferenceArea
              key={idx}
              x1={anomaly.start_time}
              x2={anomaly.end_time}
              fill="#FF3B30"
              fillOpacity={0.2}
            />
          ))}
        </LineChart>
      </TransformComponent>
    </TransformWrapper>
  );
}
```

## 🚀 구현 체크리스트

### FEAT-1: 파일 업로드
- [ ] react-dropzone으로 드래그 앤 드롭 UI 구현
- [ ] .wav 파일만 허용 (accept 설정)
- [ ] 50MB 파일 크기 제한 (클라이언트 측)
- [ ] 파일 선택 후 자동으로 업로드 시작
- [ ] 로딩 스피너 표시 (분석 중)

### FEAT-2: 그래프 시각화 및 인터랙션
- [ ] Recharts로 시계열 그래프 렌더링
- [ ] react-zoom-pan-pinch로 핀치 줌 기능 추가
- [ ] 이상 구간 ReferenceArea로 붉은색 표시
- [ ] 이상 구간 클릭 시 팝업/툴팁 표시

### FEAT-2-1: 친절한 가이드 메시지
- [ ] 이상 구간 클릭 시 "이 구간은 85% 확률로 불규칙해요" 메시지
- [ ] 말풍선 스타일의 GuideBubble 컴포넌트
- [ ] 메시지 톤: "친절한 연구원 선배"

### FEAT-3: 결과 저장
- [ ] html2canvas로 결과 화면 캡처
- [ ] "결과 저장하기" 버튼 (44px 이상)
- [ ] PNG 파일로 다운로드 (파일명: ecg-analysis-{timestamp}.png)

### 추가 최적화
- [ ] 버튼 최소 높이 44px 적용
- [ ] Pretendard 폰트 적용
- [ ] 에러 메시지 친절한 톤으로 작성
- [ ] 로딩 상태 명확히 표시
- [ ] 태블릿 레이아웃 테스트 (iPad, Android)

## 🧪 테스트 가이드

### 로컬 개발 환경 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 환경변수 설정 (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### E2E 테스트 (Playwright)

```bash
npm install -D @playwright/test

# 테스트 실행
npx playwright test
```

**테스트 시나리오** (`tests/e2e.spec.ts`):
```typescript
test('파일 업로드부터 결과 저장까지 전체 플로우', async ({ page }) => {
  await page.goto('/');

  // 1. 파일 업로드
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('public/sample.wav');

  // 2. 분석 결과 대기
  await page.waitForSelector('#ecg-chart');

  // 3. 핀치 줌 시뮬레이션 (터치 이벤트)
  // ...

  // 4. 결과 저장 버튼 클릭
  await page.click('button:has-text("결과 저장하기")');

  // 5. 다운로드 확인
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/ecg-analysis-.*\.png/);
});
```

## 🌐 배포 (Vercel)

### 1. Vercel CLI 설치 및 로그인

```bash
npm install -g vercel
vercel login
```

### 2. 환경변수 설정

Vercel 대시보드에서 설정:
- `NEXT_PUBLIC_API_URL`: FastAPI 백엔드 URL (Cloud Run/Lambda URL)

### 3. 배포

```bash
# 프로덕션 배포
vercel --prod

# 또는 Git 연동 시 자동 배포 (main 브랜치 push)
```

### 4. vercel.json 설정 (선택사항)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

## 🔒 보안 고려사항

### 1. 클라이언트 측 검증
```typescript
// 파일 크기 검증
if (file.size > 50 * 1024 * 1024) {
  alert('파일 크기가 너무 커요! 50MB 이하로 올려주세요.');
  return;
}

// 파일 타입 검증
if (!file.type.includes('audio/wav')) {
  alert('WAV 파일만 올릴 수 있어요!');
  return;
}
```

### 2. HTTPS 강제
Vercel은 자동으로 HTTPS를 제공하지만, API 호출 시 확인:
```typescript
if (!API_BASE_URL.startsWith('https://') && process.env.NODE_ENV === 'production') {
  console.warn('프로덕션 환경에서는 HTTPS를 사용해야 합니다!');
}
```

### 3. XSS 방지
React는 기본적으로 XSS를 방지하지만, `dangerouslySetInnerHTML` 사용 금지.

## 📚 참고 자료

- [Next.js 14 App Router 공식 문서](https://nextjs.org/docs)
- [Recharts 공식 문서](https://recharts.org/)
- [react-zoom-pan-pinch GitHub](https://github.com/BetterTyped/react-zoom-pan-pinch)
- [html2canvas 공식 문서](https://html2canvas.hertzen.com/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)

## 🆘 트러블슈팅

### 문제 1: 핀치 줌이 작동하지 않음
**해결**: `TransformWrapper`의 `wheel={{ disabled: true }}`를 제거하고, 터치 이벤트가 차단되지 않도록 CSS `touch-action: none` 확인.

### 문제 2: html2canvas가 그래프를 제대로 캡처하지 못함
**해결**: SVG 기반 Recharts는 직접 캡처가 어려울 수 있음. `useCrossOrigin: true` 옵션 추가하거나, Canvas 기반 차트로 전환 고려.

### 문제 3: 배포 후 API 호출 CORS 에러
**해결**: FastAPI 백엔드에서 Vercel 도메인을 CORS 허용 목록에 추가:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_methods=["POST"],
    allow_headers=["*"],
)
```

## 📞 문의

구현 중 문제가 발생하면 PRD, TRD, Prompt_Design.md를 참고하세요.
