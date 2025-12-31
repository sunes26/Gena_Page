// components/dashboard/UsageWarningBanner.tsx
'use client';

import { AlertTriangle, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { USAGE_LIMITS } from '@/lib/constants';

interface UsageWarningBannerProps {
  currentUsage: number;
  limit?: number;
}

export default function UsageWarningBanner({
  currentUsage,
  limit = USAGE_LIMITS.FREE_DAILY_LIMIT,
}: UsageWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const usagePercentage = currentUsage / limit;
  const remaining = Math.max(0, limit - currentUsage);

  // 경고 표시 조건: 66% 이상 사용 (2개 이상 사용 시)
  const shouldShowWarning = usagePercentage >= USAGE_LIMITS.WARNING_THRESHOLD;

  // 100% 사용 완료
  const isLimitReached = currentUsage >= limit;

  // 배너를 숨김 처리했거나 경고가 필요없으면 렌더링 안 함
  if (dismissed || !shouldShowWarning) {
    return null;
  }

  return (
    <div
      className={`relative rounded-lg border-2 p-4 ${
        isLimitReached
          ? 'bg-red-50 border-red-300'
          : 'bg-yellow-50 border-yellow-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0">
          {isLimitReached ? (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          )}
        </div>

        {/* 메시지 */}
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold mb-1 ${
              isLimitReached ? 'text-red-900' : 'text-yellow-900'
            }`}
          >
            {isLimitReached
              ? '⚠️ 오늘 무료 요약 한도를 모두 사용했습니다'
              : `⚠️ 오늘 무료 요약 ${remaining}회 남았습니다`}
          </h3>
          <p
            className={`text-sm ${
              isLimitReached ? 'text-red-800' : 'text-yellow-800'
            }`}
          >
            {isLimitReached ? (
              <>
                무료 플랜은 일 {limit}회 요약으로 제한됩니다.
                <br />
                <strong>Pro 플랜으로 업그레이드</strong>하면 무제한으로 요약을 생성할 수 있습니다.
              </>
            ) : (
              <>
                무료 플랜은 일 {limit}회 요약으로 제한됩니다. 현재 <strong>{currentUsage}/{limit}회</strong> 사용 중입니다.
                <br />
                Pro 플랜으로 업그레이드하면 무제한으로 요약을 생성할 수 있습니다.
              </>
            )}
          </p>

          {/* CTA 버튼 */}
          <Link
            href="/subscription"
            className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isLimitReached
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pro 플랜 보기</span>
          </Link>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={() => setDismissed(true)}
          className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
            isLimitReached
              ? 'hover:bg-red-100 text-red-600'
              : 'hover:bg-yellow-100 text-yellow-600'
          }`}
          aria-label="배너 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 진행 바 */}
      <div className="mt-3 bg-white/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isLimitReached ? 'bg-red-600' : 'bg-yellow-600'
          }`}
          style={{ width: `${Math.min(usagePercentage * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
