// lib/toast-helpers.ts
import toast from 'react-hot-toast';

/**
 * 성공 토스트
 */
export const showSuccess = (message: string) => {
  return toast.success(message);
};

/**
 * 에러 토스트
 */
export const showError = (message: string) => {
  return toast.error(message);
};

/**
 * 로딩 토스트
 */
export const showLoading = (message: string = '처리 중...') => {
  return toast.loading(message);
};

/**
 * 토스트 제거
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * 모든 토스트 제거
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Promise 기반 토스트
 * - 로딩 → 성공/실패 자동 전환
 */
export const showPromiseToast = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};