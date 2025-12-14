// components/ui/SkeletonLoader.tsx
/**
 * 스켈레톤 로더 컴포넌트
 * 일관된 로딩 UI 제공
 */

interface SkeletonProps {
  className?: string;
}

/**
 * 기본 스켈레톤 박스
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * 구독 카드 스켈레톤
 */
export function SubscriptionCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* 설명 */}
      <Skeleton className="h-4 w-3/4" />

      {/* 가격 */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* 버튼들 */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

/**
 * 결제 내역 행 스켈레톤
 */
export function PaymentRowSkeleton() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-3 w-32" />
      </td>
      <td className="px-6 py-4 text-right">
        <Skeleton className="h-8 w-24 ml-auto" />
      </td>
    </tr>
  );
}

/**
 * 결제 내역 테이블 스켈레톤
 */
export function PaymentTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
              <th className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-16" />
              </th>
              <th className="px-6 py-4 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <PaymentRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 통계 카드 스켈레톤
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/**
 * 대시보드 로딩 스켈레톤
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* 차트 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
