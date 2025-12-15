# Google Analytics 4 체크리스트

## ✅ Vercel 환경 변수 확인
1. Vercel Dashboard → 프로젝트 → Settings → Environment Variables
2. 다음 변수가 있는지 확인:
   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: `G-4NN0848Q61`
   - Environment: Production, Preview, Development 모두 체크

## ✅ GA4 속성 설정 확인
1. Google Analytics → Admin → Data Streams
2. 웹 스트림이 활성화되어 있는지 확인
3. Enhanced Measurement가 켜져 있는지 확인

## ✅ 데이터 수집 활성화 확인
1. Google Analytics → Admin → Data Settings → Data Collection
2. "Google signals data collection"이 ON인지 확인

## ✅ 실시간 보고서 테스트
1. 사이트 방문 (Vercel 배포된 URL)
2. Google Analytics → Reports → Realtime
3. 1-2분 내에 활성 사용자가 표시되는지 확인

## ⚠️ 주의사항
- Ad Blocker 사용 시 비활성화 필요
- 로컬 개발 환경(localhost)은 GA4에서 필터링될 수 있음
- 데이터 수집 시작까지 24-48시간 소요될 수 있음
- 개인정보 보호 모드/시크릿 모드에서는 추적 안 될 수 있음

## 🔍 브라우저 개발자 도구 확인
1. 배포된 사이트 방문
2. F12 → Network 탭
3. 필터에 "gtag" 또는 "google-analytics" 입력
4. 다음 요청이 있는지 확인:
   - `https://www.googletagmanager.com/gtag/js?id=G-4NN0848Q61`
   - `https://www.google-analytics.com/g/collect` (여러 번)

## 🐛 디버그 모드 활성화 (임시)
GA가 제대로 작동하는지 확인하려면 브라우저 콘솔에서:
```javascript
// 현재 페이지에 gtag가 로드되었는지 확인
console.log(window.gtag);
console.log(window.dataLayer);
```
