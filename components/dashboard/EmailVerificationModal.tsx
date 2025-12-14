// components/dashboard/EmailVerificationModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { sendEmailVerification } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase/client';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { Mail, CheckCircle } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  userEmail: string;
}

/**
 * 이메일 인증 모달 컴포넌트
 * 
 * @description
 * - 이메일 미인증 사용자에게 자동으로 표시
 * - "이메일로 인증받기" 버튼 제공
 * - Firebase sendEmailVerification() 호출
 * - 다국어 지원 (한국어/영어)
 * - 닫기 불가 (인증 완료 전까지)
 * 
 * @example
 * <EmailVerificationModal 
 *   isOpen={!user.emailVerified} 
 *   userEmail={user.email}
 * />
 */
export default function EmailVerificationModal({ 
  isOpen, 
  userEmail 
}: EmailVerificationModalProps) {
  const { t } = useTranslation();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  /**
   * 인증 이메일 발송
   */
  const handleSendVerificationEmail = async () => {
    try {
      setIsSending(true);
      
      const auth = getAuthInstance();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast.error(t('auth.errors.userNotFound'));
        return;
      }

      // Firebase 이메일 인증 발송
      await sendEmailVerification(currentUser, {
        url: `${window.location.origin}/dashboard`, // 인증 후 돌아올 URL
        handleCodeInApp: false,
      });

      setEmailSent(true);
      toast.success(t('emailVerification.emailSent'));
      
      console.log('✅ Verification email sent to:', userEmail);
    } catch (error: unknown) {
      console.error('❌ Failed to send verification email:', error);

      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/too-many-requests') {
        toast.error(t('auth.errors.tooManyRequests'));
      } else {
        toast.error(t('emailVerification.sendError'));
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => {}} // 닫기 불가능 (인증 완료 전까지)
      className="relative z-50"
    >
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      {/* 모달 위치 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* 헤더 - 그라데이션 배경 */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <Dialog.Title className="text-2xl font-bold text-white mb-2">
              {t('emailVerification.title')}
            </Dialog.Title>
            
            <p className="text-white/90 text-sm">
              {t('emailVerification.subtitle')}
            </p>
          </div>

          {/* 본문 */}
          <div className="p-8">
            {/* 인증 필요 이유 */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                {t('emailVerification.reason')}
              </p>
            </div>

            {/* 사용자 이메일 표시 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('emailVerification.yourEmail')}
              </label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {userEmail}
                </span>
              </div>
            </div>

            {/* 인증 이메일 발송 버튼 */}
            {!emailSent ? (
              <button
                onClick={handleSendVerificationEmail}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('emailVerification.sending')}</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>{t('emailVerification.sendButton')}</span>
                  </>
                )}
              </button>
            ) : (
              // 이메일 발송 완료 상태
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {t('emailVerification.emailSentSuccess')}
                  </p>
                </div>

                {/* 다시 보내기 버튼 */}
                <button
                  onClick={handleSendVerificationEmail}
                  disabled={isSending}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isSending ? t('emailVerification.sending') : t('emailVerification.resendButton')}
                </button>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('emailVerification.nextStepsTitle')}
              </h4>
              <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
                <li>{t('emailVerification.step1')}</li>
                <li>{t('emailVerification.step2')}</li>
                <li>{t('emailVerification.step3')}</li>
              </ol>
            </div>

            {/* 도움말 */}
            <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
              {t('emailVerification.helpText')}
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}