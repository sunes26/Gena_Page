// components/dashboard/OnboardingGuide.tsx
'use client';

import { Chrome, Sparkles, BookOpen, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingGuideProps {
  isPremium?: boolean;
}

export default function OnboardingGuide({ isPremium = false }: OnboardingGuideProps) {
  const { t, locale } = useTranslation();

  const steps = [
    {
      icon: Chrome,
      title: locale === 'ko' ? 'Chrome 확장 설치' : 'Install Chrome Extension',
      description: locale === 'ko' 
        ? 'Chrome 웹스토어에서 SummaryGenie를 설치하세요'
        : 'Install SummaryGenie from Chrome Web Store',
      action: {
        label: locale === 'ko' ? '확장 프로그램 설치' : 'Install Extension',
        href: 'https://chrome.google.com/webstore',
      },
      color: 'blue',
    },
    {
      icon: Sparkles,
      title: locale === 'ko' ? '페이지 요약하기' : 'Summarize Pages',
      description: locale === 'ko'
        ? '원하는 웹페이지에서 확장 프로그램 아이콘을 클릭하세요'
        : 'Click the extension icon on any webpage you want to summarize',
      color: 'purple',
    },
    {
      icon: BookOpen,
      title: locale === 'ko' ? '요약 기록 확인' : 'View Your History',
      description: locale === 'ko'
        ? '이 대시보드에서 모든 요약 기록을 확인하고 관리하세요'
        : 'View and manage all your summaries in this dashboard',
      color: 'green',
    },
  ];

  if (!isPremium) {
    steps.push({
      icon: TrendingUp,
      title: locale === 'ko' ? 'Pro로 업그레이드' : 'Upgrade to Pro',
      description: locale === 'ko'
        ? '무제한 요약과 고급 기능을 이용하세요'
        : 'Get unlimited summaries and advanced features',
      action: {
        label: locale === 'ko' ? 'Pro 플랜 보기' : 'View Pro Plans',
        href: '/subscription',
      },
      color: 'orange',
    });
  }

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-8 border border-blue-100">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {locale === 'ko' ? '환영합니다! 🎉' : 'Welcome! 🎉'}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {locale === 'ko'
            ? 'SummaryGenie를 시작하려면 아래 단계를 따라주세요'
            : 'Follow these steps to get started with SummaryGenie'}
        </p>
      </div>

      {/* 단계별 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            {/* 아이콘 */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[step.color]}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {locale === 'ko' ? `${index + 1}단계` : `Step ${index + 1}`}
              </span>
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>

            {/* 설명 */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {step.description}
            </p>

            {/* 액션 버튼 */}
            {step.action && (
              <a
                href={step.action.href}
                target={step.action.href.startsWith('http') ? '_blank' : undefined}
                rel={step.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                {step.action.label}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 추가 도움말 */}
      <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
        <p className="text-sm text-gray-600 text-center">
          {locale === 'ko' ? (
            <>
              도움이 필요하신가요?{' '}
              <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
                도움말 센터
              </a>
              를 방문하거나{' '}
              <a href="mailto:support@summarygenie.app" className="text-blue-600 hover:text-blue-700 font-medium">
                support@summarygenie.app
              </a>
              로 문의하세요.
            </>
          ) : (
            <>
              Need help?{' '}
              <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
                Visit our Help Center
              </a>
              {' '}or contact{' '}
              <a href="mailto:support@summarygenie.app" className="text-blue-600 hover:text-blue-700 font-medium">
                support@summarygenie.app
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}