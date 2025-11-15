// app/(marketing)/page.tsx
import { Suspense, lazy } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Hero from '@/components/marketing/Hero';
import JsonLd from '@/components/seo/JsonLd';
import { 
  generateMetadata as genMeta,
  getOrganizationSchema, 
  getWebApplicationSchema,
  getFAQSchema,
} from '@/lib/metadata';

// ✅ 페이지 메타데이터 (SEO 최적화)
export const metadata: Metadata = genMeta({
  title: 'SummaryGenie - AI 웹페이지 요약',
  description: '웹 서핑 시간은 절반으로, 정보의 깊이는 두 배로. Chrome 확장 프로그램으로 한 번의 클릭으로 웹페이지를 AI가 요약합니다. 무료로 시작하세요.',
  keywords: [
    'AI 요약',
    '웹페이지 요약',
    '크롬 확장프로그램',
    'Chrome extension',
    'ChatGPT',
    '생산성 도구',
    '요약 서비스',
    '한국어 요약',
    '자동 요약',
    '정보 관리',
    'AI 도구',
  ],
  canonical: '/',
  ogImage: '/og-image.png',
});

// ✅ Dynamic Import: 뷰포트에 들어올 때만 로드
const ProblemStatement = lazy(() => import('@/components/marketing/ProblemStatement'));
const Features = lazy(() => import('@/components/marketing/Features'));
const HowItWorks = lazy(() => import('@/components/marketing/HowItWorks'));
const UseCases = lazy(() => import('@/components/marketing/UseCases'));
const Pricing = lazy(() => import('@/components/marketing/Pricing'));
const FAQ = lazy(() => import('@/components/marketing/FAQ'));
const FinalCTA = lazy(() => import('@/components/marketing/FinalCTA'));

// ✅ 로딩 스켈레톤 컴포넌트
function SectionSkeleton() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-12"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ✅ FAQ 데이터 (JSON-LD용)
const faqData = [
  {
    question: 'SummaryGenie는 무료인가요?',
    answer: '네, 기본 플랜은 완전 무료입니다. 월 30회까지 무료로 요약할 수 있으며, 무제한 사용을 원하시면 Pro 플랜(월 9,900원)을 이용하실 수 있습니다.',
  },
  {
    question: '어떤 웹페이지를 요약할 수 있나요?',
    answer: '뉴스 기사, 블로그 글, 논문, 문서 등 대부분의 웹페이지를 요약할 수 있습니다. 텍스트 기반 콘텐츠가 있는 모든 페이지에서 작동합니다.',
  },
  {
    question: 'Chrome 확장 프로그램은 어떻게 설치하나요?',
    answer: 'Chrome 웹 스토어에서 "SummaryGenie"를 검색하여 설치하거나, 웹사이트의 다운로드 버튼을 클릭하면 자동으로 Chrome 웹 스토어로 이동합니다.',
  },
  {
    question: '요약 품질은 어떤가요?',
    answer: '최신 AI 기술(GPT-4 기반)을 사용하여 핵심 내용을 정확하게 추출합니다. 한국어 콘텐츠에 특히 최적화되어 있습니다.',
  },
  {
    question: '개인정보는 안전한가요?',
    answer: '네, 귀하의 개인정보와 브라우징 데이터는 철저히 보호됩니다. 요약된 내용만 저장되며, 제3자와 공유되지 않습니다.',
  },
  {
    question: 'Pro 플랜의 혜택은 무엇인가요?',
    answer: 'Pro 플랜은 무제한 요약, 고성능 AI 엔진, 우선 지원, 고급 기능(Q&A, 태그 관리 등)을 제공합니다.',
  },
  {
    question: '언제든지 취소할 수 있나요?',
    answer: '네, Pro 플랜은 언제든지 취소할 수 있으며, 취소 시 다음 결제일까지 서비스를 계속 이용할 수 있습니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '7일 이내 환불이 가능합니다. 서비스에 만족하지 못하신 경우 전액 환불해 드립니다.',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ✅ 구조화된 데이터 (JSON-LD) */}
      <JsonLd 
        data={[
          getOrganizationSchema(),
          getWebApplicationSchema(),
          getFAQSchema(faqData),
        ]} 
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        {/* Header - 즉시 로드 */}
        <Header />

        {/* Main Content */}
        <main id="main-content">
          {/* Hero Section - 즉시 로드 (Above the fold) */}
          <Hero />

          {/* ✅ Below the fold 컴포넌트들은 Suspense로 감싸기 */}
          
          {/* Problem Statement */}
          <Suspense fallback={<SectionSkeleton />}>
            <ProblemStatement />
          </Suspense>

          {/* Features */}
          <Suspense fallback={<SectionSkeleton />}>
            <Features />
          </Suspense>

          {/* How It Works */}
          <Suspense fallback={<SectionSkeleton />}>
            <HowItWorks />
          </Suspense>

          {/* Use Cases */}
          <Suspense fallback={<SectionSkeleton />}>
            <UseCases />
          </Suspense>

          {/* Pricing */}
          <Suspense fallback={<SectionSkeleton />}>
            <Pricing />
          </Suspense>

          {/* FAQ */}
          <Suspense fallback={<SectionSkeleton />}>
            <FAQ />
          </Suspense>

          {/* Final CTA */}
          <Suspense fallback={<SectionSkeleton />}>
            <FinalCTA />
          </Suspense>
        </main>

        {/* Footer - 지연 로드 가능 */}
        <Footer />
      </div>
    </>
  );
}