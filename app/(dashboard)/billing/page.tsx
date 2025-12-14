// app/(dashboard)/billing/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useBillingHistory, PaymentRecord } from '@/hooks/useBillingHistory';
import { Receipt, Download, CheckCircle, XCircle, RotateCcw, CreditCard } from 'lucide-react';
import { PaymentTableSkeleton } from '@/components/ui/SkeletonLoader';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

export default function BillingPage() {
  const { user } = useAuth();
  const { payments, loading, error } = useBillingHistory(user?.uid || null);

  // 상태별 아이콘 및 스타일
  const getStatusDisplay = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          text: '완료',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'failed':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: '실패',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      case 'refunded':
        return {
          icon: <RotateCcw className="w-5 h-5 text-orange-600" />,
          text: '환불',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
        };
      default:
        return {
          icon: <CreditCard className="w-5 h-5 text-gray-600" />,
          text: status,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
        };
    }
  };

  // 금액 포맷 (lib/currency.ts 사용)
  const formatAmount = (amount: number, currency: string) => {
    return formatCurrency(amount, currency);
  };

  // Paddle 영수증 URL 생성
  const getReceiptUrl = (transactionId: string) => {
    // Paddle 환경에 따라 URL 다름
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
    if (environment === 'production') {
      return `https://checkout.paddle.com/receipt/${transactionId}`;
    }
    return `https://sandbox-checkout.paddle.com/receipt/${transactionId}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600">결제 내역을 확인하려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  // ✅ 로딩 상태 - 스켈레톤 UI
  if (loading) {
    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3">
          <Receipt className="w-8 h-8 text-blue-600" />
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* 테이블 스켈레톤 */}
        <PaymentTableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Receipt className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">결제 내역</h1>
            <p className="text-gray-600 mt-1">
              {payments.length > 0
                ? `총 ${payments.length}건의 결제 내역`
                : '결제 내역이 없습니다'}
            </p>
          </div>
        </div>
      </div>

      {/* 결제 내역이 없는 경우 */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 내역이 없습니다</h3>
          <p className="text-gray-600 mb-6">
            아직 결제한 내역이 없습니다.
            <br />
            Pro 플랜을 구독하시면 이곳에서 결제 내역을 확인하실 수 있습니다.
          </p>
          <a
            href="/subscription"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            구독 플랜 보기
          </a>
        </div>
      ) : (
        /* 결제 내역 테이블 */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    결제 수단
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    거래 ID
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    영수증
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const statusDisplay = getStatusDisplay(payment.status);
                  const paidDate = payment.paidAt.toDate();

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      {/* 날짜 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {paidDate.toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(paidDate, { addSuffix: true, locale: ko })}
                        </div>
                      </td>

                      {/* 상태 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.bgColor} ${statusDisplay.textColor} ${statusDisplay.borderColor}`}
                        >
                          {statusDisplay.icon}
                          <span>{statusDisplay.text}</span>
                        </span>
                        {payment.status === 'refunded' && payment.refundedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {payment.refundedAt.toDate().toLocaleDateString('ko-KR')} 환불
                          </div>
                        )}
                        {payment.status === 'failed' && payment.failureReason && (
                          <div className="text-xs text-red-600 mt-1">{payment.failureReason}</div>
                        )}
                      </td>

                      {/* 금액 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                        <div className="text-xs text-gray-500">{payment.currency}</div>
                      </td>

                      {/* 결제 수단 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 capitalize">
                            {payment.method}
                          </span>
                        </div>
                      </td>

                      {/* 거래 ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500 font-mono">
                          {payment.transactionId.substring(0, 20)}...
                        </div>
                      </td>

                      {/* 영수증 */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {payment.status === 'completed' && (
                          <a
                            href={getReceiptUrl(payment.transactionId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Download className="w-4 h-4" />
                            <span>다운로드</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 안내 문구 */}
      {payments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">영수증 안내</h4>
              <p className="text-sm text-blue-700">
                영수증 다운로드 버튼을 클릭하면 Paddle에서 제공하는 공식 영수증 페이지로 이동합니다.
                <br />
                영수증은 PDF로 다운로드하거나 인쇄할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
