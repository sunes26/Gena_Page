// components/marketing/HowItWorks.tsx
import { Download, MousePointerClick, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Download,
      title: 'Chrome 확장 설치',
      description: 'Chrome 웹 스토어에서 SummaryGenie를 설치하세요. 무료이며 몇 초면 완료됩니다.',
    },
    {
      number: '02',
      icon: MousePointerClick,
      title: '웹페이지에서 실행',
      description: '읽고 싶은 페이지에서 확장 아이콘을 클릭하거나 단축키를 누르세요.',
    },
    {
      number: '03',
      icon: Sparkles,
      title: '즉시 요약 확인',
      description: 'AI가 3초 안에 핵심 내용을 요약해드립니다. 질문도 자유롭게 하세요.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-slate-100 dark:bg-slate-900/50">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              사용법은 간단합니다
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              3단계로 시작하는 스마트한 웹 서핑
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 -translate-y-1/2 opacity-20" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 150}>
                <div className="relative">
                  {/* Step Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    {/* Step Number */}
                    <div className="text-6xl font-bold text-slate-200 dark:text-slate-700 mb-4">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-full z-10">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-16 text-center">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              지금 바로 시작해보세요. 설치부터 사용까지 3분이면 충분합니다.
            </p>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Download className="w-5 h-5" />
              무료로 시작하기
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}