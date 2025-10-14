// components/marketing/UseCases.tsx
import { GraduationCap, Briefcase, Newspaper } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function UseCases() {
  const cases = [
    {
      icon: GraduationCap,
      title: '학생 & 연구자',
      description: '논문, 리포트, 학술 자료를 빠르게 파악하고 핵심만 정리하세요.',
      benefits: [
        '시험 준비 시간 단축',
        '논문 리뷰 효율화',
        '참고 문헌 빠른 파악',
      ],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Briefcase,
      title: '직장인 & 전문가',
      description: '업무 관련 문서, 보고서, 기술 문서를 신속하게 이해하세요.',
      benefits: [
        '회의 준비 시간 절약',
        '산업 트렌드 빠른 파악',
        '경쟁사 분석 효율화',
      ],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Newspaper,
      title: '일반 사용자',
      description: '뉴스, 블로그, 기사 등을 빠르게 읽고 중요한 정보만 얻으세요.',
      benefits: [
        '뉴스 큐레이션',
        '트렌드 빠른 캐치업',
        '관심사 효율적 탐색',
      ],
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              누가 사용하나요?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              다양한 분야에서 시간을 절약하고 있습니다
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {cases.map((useCase, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                {/* Icon */}
                <div className={`w-16 h-16 ${useCase.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${useCase.color} rounded-lg flex items-center justify-center`}>
                    <useCase.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {useCase.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3">
                  {useCase.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${useCase.color}`} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">
              당신의 시간을 더 가치있게
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              매일 수십 개의 글을 읽어야 한다면,
              <br />
              SummaryGenie로 하루 2시간을 절약하세요.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-left">
              <div>
                <div className="text-4xl font-bold">2시간</div>
                <div className="text-blue-100">평균 절약 시간</div>
              </div>
              <div>
                <div className="text-4xl font-bold">90%</div>
                <div className="text-blue-100">사용자 만족도</div>
              </div>
              <div>
                <div className="text-4xl font-bold">5분</div>
                <div className="text-blue-100">학습 시간</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}