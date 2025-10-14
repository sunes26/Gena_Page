// components/dashboard/NotificationSettings.tsx
'use client';

import { useState } from 'react';
import { Bell, Mail, Zap, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast-helpers';

interface NotificationSettingsProps {
  userId: string;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  // 알림 설정 상태
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [summaryComplete, setSummaryComplete] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [promotions, setPromotions] = useState(false);
  const [loading, setLoading] = useState(false);

  // 설정 저장
  const handleSave = async () => {
    setLoading(true);

    try {
      // TODO: API로 알림 설정 저장
      // await fetch('/api/user/notifications', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     emailNotifications,
      //     summaryComplete,
      //     weeklyReport,
      //     promotions,
      //   }),
      // });

      // 임시: 로컬스토리지에 저장
      localStorage.setItem(
        `notifications_${userId}`,
        JSON.stringify({
          emailNotifications,
          summaryComplete,
          weeklyReport,
          promotions,
        })
      );

      showSuccess('알림 설정이 저장되었습니다.');
    } catch (error) {
      showError('알림 설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
        <p className="text-sm text-gray-500 mb-6">
          받고 싶은 알림을 선택하세요.
        </p>
      </div>

      {/* 이메일 알림 */}
      <div className="space-y-4">
        {/* 이메일 알림 전체 토글 */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">이메일 알림</h4>
              <p className="text-xs text-gray-500">모든 이메일 알림 활성화/비활성화</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 개별 알림 설정 */}
        <div className={`space-y-3 ${!emailNotifications ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* 요약 완료 알림 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">요약 완료 알림</h4>
                <p className="text-xs text-gray-500">웹페이지 요약이 완료되면 이메일로 알립니다.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={summaryComplete}
                onChange={(e) => setSummaryComplete(e.target.checked)}
                disabled={!emailNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 주간 리포트 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">주간 리포트</h4>
                <p className="text-xs text-gray-500">매주 월요일 사용 통계를 이메일로 받습니다.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={weeklyReport}
                onChange={(e) => setWeeklyReport(e.target.checked)}
                disabled={!emailNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 프로모션 */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">프로모션 및 이벤트</h4>
                <p className="text-xs text-gray-500">새로운 기능, 할인 정보를 이메일로 받습니다.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={promotions}
                onChange={(e) => setPromotions(e.target.checked)}
                disabled={!emailNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '변경사항 저장'
          )}
        </button>
      </div>
    </div>
  );
}