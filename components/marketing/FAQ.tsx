// components/marketing/FAQ.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'SummaryGenie는 어떻게 작동하나요?',
      answer: 'SummaryGenie는 최신 GPT 기술을 활용하여 웹페이지의 텍스트를 분석하고, 핵심 내용만 추출하여 간결하게 요약합니다. Chrome 확장 프로그램으로 설치하면 원하는 페이지에서 바로 사용할 수 있습니다.',
    },
    {
      question: '어떤 웹사이트에서 사용할 수 있나요?',
      answer: '대부분의 웹사이트에서 사용 가능합니다. 뉴스 기사, 블로그, 학술 논문, 기술 문서 등 텍스트 기반 콘텐츠가 있는 모든 페이지에서 작동합니다. 단, 로그인이 필요한 페이지나 동영상 콘텐츠는 제한될 수 있습니다.',
    },
    {
      question: '무료 플랜과 Pro 플랜의 차이는 무엇인가요?',
      answer: '무료 플랜은 하루 10회까지 요약을 생성할 수 있으며, 기본 AI 모델을 사용합니다. Pro 플랜은 무제한 요약, 고성능 GPT-4 모델, 우선 처리, PDF 요약 지원 등 고급 기능을 제공합니다.',
    },
    {
      question: '요약된 내용은 얼마나 정확한가요?',
      answer: '최신 GPT-4 모델을 사용하여 약 95% 이상의 정확도를 유지합니다. 하지만 AI 특성상 100% 완벽하지 않을 수 있으므로, 중요한 결정을 내리기 전에는 원문을 확인하시는 것을 권장합니다.',
    },
    {
      question: '한국어 웹페이지도 요약할 수 있나요?',
      answer: '네, 한국어를 완벽하게 지원합니다. 한국어 웹페이지를 정확하게 이해하고 자연스러운 한국어로 요약합니다. 영어, 일본어, 중국어 등 다른 언어도 지원합니다.',
    },
    {
      question: '요약된 내용은 어디에 저장되나요?',
      answer: '모든 요약은 안전하게 암호화되어 클라우드에 저장됩니다. 웹 대시보드에서 언제든지 과거 요약 기록을 확인할 수 있습니다. Free 플랜은 7일간, Pro 플랜은 무제한으로 저장됩니다.',
    },
    {
      question: '환불이 가능한가요?',
      answer: '네, 가능합니다. 서비스에 만족하지 못하신 경우 구독 후 14일 이내에 전액 환불을 요청하실 수 있습니다. 환불은 영업일 기준 3-5일 내에 처리됩니다.',
    },
    {
      question: '개인정보는 안전한가요?',
      answer: '사용자의 개인정보 보호를 최우선으로 합니다. 모든 데이터는 암호화되어 저장되며, 제3자와 공유되지 않습니다. 요약된 콘텐츠는 AI 학습에 사용되지 않습니다.',
    },
  ];

  return (
    <section id="faq" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              자주 묻는 질문
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              궁금하신 점이 있으신가요?
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} delay={index * 50}>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-semibold text-lg pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="mt-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              더 궁금하신 점이 있으신가요?
            </p>
            <a
              href="mailto:support@summarygenie.app"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              support@summarygenie.app
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}