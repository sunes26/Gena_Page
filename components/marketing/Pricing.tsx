// components/marketing/Pricing.tsx
import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '₩0',
      period: '영구 무료',
      description: '기본 기능을 체험해보세요',
      features: [
        '하루 10회 요약',
        '기본 AI 모델',
        '한국어 지원',
        '요약 히스토리 7일',
        '웹 대시보드 접근',
      ],
      cta: '무료로 시작하기',
      href: '/signup',
      popular: false,
    },
    {
      name: 'Pro',
      price: '₩9,900',
      period: '월',
      description: '무제한으로 사용하세요',
      features: [
        '무제한 요약',
        '고성능 AI 모델 (GPT-4)',
        '우선 처리',
        '요약 히스토리 무제한',
        '고급 Q&A 기능',
        '맞춤형 요약 템플릿',
        'PDF 요약 지원',
        '이메일 지원',
      ],
      cta: 'Pro 시작하기',
      href: '/signup?plan=pro',
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-slate-100 dark:bg-slate-900/50">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              간단하고 투명한 요금제
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              언제든 업그레이드하거나 취소할 수 있습니다
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div
                className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all ${
                  plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                      <Crown className="w-4 h-4" />
                      <span>가장 인기</span>
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period !== '영구 무료' && (
                      <span className="text-slate-600 dark:text-slate-400">/ {plan.period}</span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={plan.href}>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                        : ''
                    }`}
                    size="lg"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={200}>
          <div className="mt-16 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              모든 플랜은 7일 무료 체험이 가능합니다 • 신용카드 등록 불필요
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>언제든 취소 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>환불 보장</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>안전한 결제</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}