// app/(marketing)/pricing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { 
  generateProductMetadata,
  getProductSchema,
  getBreadcrumbSchema,
} from '@/lib/metadata';

// ✅ 페이지 메타데이터 (SEO 최적화)
export const metadata: Metadata = generateProductMetadata({
  title: '요금제 - 무료로 시작하기',
  description: 'SummaryGenie의 Free 플랜(무료)과 Pro 플랜(월 9,900원)을 비교하세요. 무제한 AI 요약, 고성능 엔진, 우선 지원을 제공합니다.',
  price: '9900',
  currency: 'KRW',
  availability: 'in stock',
  canonical: '/pricing',
  ogImage: '/og-pricing.png',
});

// ✅ 빵 부스러기 데이터
const breadcrumbItems = [
  { name: '홈', url: '/' },
  { name: '요금제', url: '/pricing' },
];

export default function PricingPage() {
  return (
    <>
      {/* ✅ 구조화된 데이터 (JSON-LD) */}
      <JsonLd 
        data={[
          getProductSchema(),
          getBreadcrumbSchema(breadcrumbItems),
        ]} 
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <Header />

        <main className="container mx-auto px-4 py-16 max-w-6xl">
          {/* 헤더 섹션 */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              간단하고 투명한 요금제
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              무료로 시작하고, 필요할 때 Pro로 업그레이드하세요
            </p>
          </section>

          {/* 요금제 카드 */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* Free 플랜 */}
            <PricingCard
              name="Free"
              price="무료"
              description="개인 사용자를 위한 기본 플랜"
              features={[
                { name: '월 30회 요약', included: true },
                { name: '기본 AI 엔진', included: true },
                { name: '요약 기록 저장', included: true },
                { name: '검색 및 필터링', included: true },
                { name: '무제한 요약', included: false },
                { name: '고성능 AI 엔진', included: false },
                { name: '우선 지원', included: false },
                { name: '고급 기능', included: false },
              ]}
              ctaText="무료로 시작하기"
              ctaLink="/signup"
              popular={false}
            />

            {/* Pro 플랜 */}
            <PricingCard
              name="Pro"
              price="₩9,900"
              priceUnit="/월"
              description="무제한으로 사용하는 프로 플랜"
              features={[
                { name: '무제한 요약', included: true },
                { name: '고성능 AI 엔진 (GPT-4)', included: true },
                { name: '요약 기록 무제한 저장', included: true },
                { name: '검색 및 필터링', included: true },
                { name: 'Q&A 기능', included: true },
                { name: '태그 관리', included: true },
                { name: '우선 지원', included: true },
                { name: '신규 기능 우선 액세스', included: true },
              ]}
              ctaText="Pro로 업그레이드"
              ctaLink="/signup"
              popular={true}
            />
          </div>

          {/* FAQ 섹션 */}
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              자주 묻는 질문
            </h2>
            <div className="space-y-4">
              <FAQItem
                question="언제든지 취소할 수 있나요?"
                answer="네, Pro 플랜은 언제든지 취소할 수 있습니다. 취소 시 다음 결제일까지 서비스를 계속 이용할 수 있습니다."
              />
              <FAQItem
                question="환불 정책은 어떻게 되나요?"
                answer="7일 이내 환불이 가능합니다. 서비스에 만족하지 못하신 경우 전액 환불해 드립니다."
              />
              <FAQItem
                question="결제 수단은 무엇이 있나요?"
                answer="신용카드, 체크카드, 계좌이체 등 다양한 결제 수단을 지원합니다."
              />
              <FAQItem
                question="Free 플랜에서 Pro로 업그레이드하면 어떻게 되나요?"
                answer="즉시 Pro 플랜의 모든 혜택을 받을 수 있습니다. 기존 요약 기록은 그대로 유지됩니다."
              />
              <FAQItem
                question="Pro 플랜을 취소하면 데이터가 삭제되나요?"
                answer="아니요, 요약 기록은 그대로 유지됩니다. Free 플랜으로 전환되어 월 30회까지 계속 사용할 수 있습니다."
              />
            </div>
          </section>

          {/* 최종 CTA */}
          <section className="text-center mt-16 p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              무료 플랜으로 시작하고, 필요할 때 Pro로 업그레이드하세요
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                로그인
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

// ✅ 요금제 카드 컴포넌트
interface PricingCardProps {
  name: string;
  price: string;
  priceUnit?: string;
  description: string;
  features: Array<{ name: string; included: boolean }>;
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
}

function PricingCard({
  name,
  price,
  priceUnit,
  description,
  features,
  ctaText,
  ctaLink,
  popular = false,
}: PricingCardProps) {
  return (
    <article 
      className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 ${
        popular ? 'ring-2 ring-blue-600' : ''
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          인기
        </div>
      )}

      <header className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <div className="mb-2">
          <span className="text-4xl font-bold">{price}</span>
          {priceUnit && (
            <span className="text-gray-500 dark:text-gray-400 ml-1">
              {priceUnit}
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </header>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            {feature.included ? (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X className="w-5 h-5 text-gray-300 flex-shrink-0" aria-hidden="true" />
            )}
            <span 
              className={feature.included ? '' : 'text-gray-400 line-through'}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaLink}
        className={`block w-full py-3 text-center rounded-lg font-semibold transition ${
          popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {ctaText}
      </Link>
    </article>
  );
}

// ✅ FAQ 아이템 컴포넌트
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="bg-white dark:bg-slate-800 rounded-lg p-6 group">
      <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
        {question}
        <span className="transition group-open:rotate-180">
          <svg
            fill="none"
            height="20"
            width="20"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <p className="mt-4 text-gray-600 dark:text-gray-400">{answer}</p>
    </details>
  );
}