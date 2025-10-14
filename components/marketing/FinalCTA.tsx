// components/marketing/FinalCTA.tsx
import Link from 'next/link';
import { ArrowRight, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScrollReveal from './ScrollReveal';

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto max-w-4xl">
        <ScrollReveal>
          <div className="text-center space-y-8 text-white">
            <h2 className="text-4xl md:text-5xl font-bold">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              수천 명의 사용자가 이미 SummaryGenie로
              <br />
              매일 2시간을 절약하고 있습니다
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 py-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-blue-100 text-sm">활성 사용자</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100K+</div>
                <div className="text-blue-100 text-sm">요약 생성</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.9/5</div>
                <div className="text-blue-100 text-sm">사용자 평점</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 gap-2"
                >
                  <Chrome className="w-5 h-5" />
                  무료로 시작하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  요금제 보기
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>신용카드 불필요</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>언제든 취소 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>7일 무료 체험</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}