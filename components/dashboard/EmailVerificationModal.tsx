// components/dashboard/EmailVerificationModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { sendEmailVerification } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase/client';
import { useTranslation } from '@/hooks/useTranslation';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { updateUserEmail } from '@/lib/auth';
import { translateAuthError } from '@/lib/auth-errors';

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

  // 이메일 변경 상태
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isChangingInProgress, setIsChangingInProgress] = useState(false);

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

  /**
   * 이메일 변경 처리
   */
  const handleChangeEmail = async () => {
    // 유효성 검사
    if (!currentPassword.trim()) {
      toast.error(t('auth.errors.passwordRequired') || '비밀번호를 입력해주세요.');
      return;
    }

    if (!newEmail.trim()) {
      toast.error(t('auth.errors.invalidEmail') || '새 이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error(t('auth.errors.invalidEmail') || '올바른 이메일 형식이 아닙니다.');
      return;
    }

    if (newEmail.toLowerCase() === userEmail.toLowerCase()) {
      toast.error('현재 이메일과 동일합니다.');
      return;
    }

    setIsChangingInProgress(true);

    try {
      // 이메일 변경 (재인증 + 새 이메일로 인증 링크 발송)
      // ✅ verifyBeforeUpdateEmail 사용: 사용자가 링크를 클릭하면 자동으로 이메일 변경됨
      await updateUserEmail(newEmail, currentPassword);

      toast.success(
        `${newEmail}로 인증 링크를 보냈습니다. 이메일을 확인하고 링크를 클릭하면 이메일이 변경됩니다.`,
        { duration: 5000 }
      );

      // 상태 초기화 및 기본 화면으로
      setCurrentPassword('');
      setNewEmail('');
      setIsChangingEmail(false);

      // ℹ️ 즉시 변경되지 않으므로 새로고침 제거
      // 사용자가 새 이메일의 링크를 클릭하면 자동으로 변경됨
    } catch (error: unknown) {
      console.error('❌ Failed to change email:', error);
      const errorMessage = translateAuthError(error, t);
      toast.error(errorMessage || '이메일 변경에 실패했습니다.');
    } finally {
      setIsChangingInProgress(false);
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
            {!isChangingEmail ? (
              <>
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
              </>
            ) : (
              <>
                {/* 이메일 변경 화면 */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setIsChangingEmail(false);
                      setCurrentPassword('');
                      setNewEmail('');
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>돌아가기</span>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                        이메일 주소를 변경하시겠습니까?
                      </p>
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        새 이메일로 인증 링크를 보냅니다. 링크를 클릭하면 이메일이 변경됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 현재 비밀번호 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isChangingInProgress}
                  />
                </div>

                {/* 새 이메일 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    새 이메일 주소
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="새 이메일을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isChangingInProgress}
                  />
                </div>

                {/* 이메일 변경 버튼 */}
                <button
                  onClick={handleChangeEmail}
                  disabled={isChangingInProgress || !currentPassword || !newEmail}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>변경 중...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>이메일 변경하기</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* 인증 이메일 발송 버튼 (기본 화면에서만 표시) */}
            {!isChangingEmail && (
              <>
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

                {/* 이메일 변경 링크 */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsChangingEmail(true)}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline"
                  >
                    이메일 주소가 잘못되었나요?
                  </button>
                </div>
              </>
            )}

            {/* 안내 메시지 (기본 화면에서만 표시) */}
            {!isChangingEmail && (
              <>
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
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}