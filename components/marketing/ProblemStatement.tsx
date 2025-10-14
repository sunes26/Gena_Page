// components/marketing/ProblemStatement.tsx
import { AlertCircle, Clock, BookOpen, Brain } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function ProblemStatement() {
  const problems = [
    {
      icon: Clock,
      title: '시간 부족',
      description: '읽어야 할 자료는 많은데, 시간은 항상 부족합니다.',
    },
    {
      icon: BookOpen,
      title: '정보 과부하',
      description: '너무 많은 정보 속에서 정작 중요한 내용을 놓치기 쉽습니다.',
    },
    {
      icon: Brain,
      title: '집중력 저하',
      description: '긴 글을 읽다 보면 집중력이 떨어지고 핵심을 놓칩니다.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-slate-100 dark:bg-slate-900/50">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full text-sm font-medium text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span>이런 고민 있으신가요?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              정보의 홍수 속에서
              <br />
              <span className="text-slate-600 dark:text-slate-400">길을 잃고 계신가요?</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6">
                  <problem.icon className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{problem.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={300}>
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 max-w-3xl">
              <p className="text-2xl font-semibold text-white">
                "매일 쏟아지는 정보를 어떻게 소화하시나요?"
              </p>
              <p className="mt-4 text-blue-100">
                SummaryGenie가 여러분의 시간을 지켜드립니다.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}