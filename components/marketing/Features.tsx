// components/marketing/Features.tsx
import { Sparkles, MessageSquare, Languages, Zap, Shield, Smartphone } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Features() {
  const mainFeatures = [
    {
      icon: Sparkles,
      title: 'AI 자동 요약',
      description: '최신 GPT 기술로 웹페이지의 핵심 내용을 즉시 요약합니다.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: '스마트 Q&A',
      description: '궁금한 점을 물어보세요. AI가 문서 내용을 기반으로 답변합니다.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Languages,
      title: '완벽한 한국어 지원',
      description: '한국어 웹페이지도 정확하게 요약하고 이해합니다.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: '빠른 처리',
      description: '클릭 한 번으로 3초 내 요약 완료',
    },
    {
      icon: Shield,
      title: '프라이버시 보호',
      description: '모든 데이터는 안전하게 암호화',
    },
    {
      icon: Smartphone,
      title: '어디서나 접근',
      description: '웹 대시보드로 언제든지 확인',
    },
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              강력한 기능으로
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                생산성을 극대화
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              복잡한 설정 없이, 설치하자마자 바로 사용할 수 있습니다.
            </p>
          </div>
        </ScrollReveal>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Additional Features */}
        <ScrollReveal delay={300}>
          <div className="grid md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}