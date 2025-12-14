// lib/auth-errors.ts
/**
 * Firebase Auth 에러 코드를 번역 키로 변환
 * 
 * ✅ Firebase v10+ 에러 코드 지원
 * ✅ 로그인, 회원가입, 비밀번호 재설정 에러 처리
 * 
 * @param errorCode - Firebase Auth 에러 코드 또는 에러 객체
 * @returns 번역 키 (예: "auth.errors.wrongPassword")
 * 
 * @example
 * ```tsx
 * import { getAuthErrorKey } from '@/lib/auth-errors';
 * import { useTranslation } from '@/hooks/useTranslation';
 * 
 * const { t } = useTranslation();
 * 
 * try {
 *   await signInWithEmail(email, password);
 * } catch (error) {
 *   const errorKey = getAuthErrorKey(error);
 *   showError(t(errorKey));
 * }
 * ```
 */
export function getAuthErrorKey(error: unknown): string {
  // 에러 코드 추출
  let code: string;
  
  if (typeof error === 'string') {
    code = error;
  } else if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    code = error.code;
  } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    // Error 객체에서 코드 추출 시도
    // Firebase 에러 메시지에서 코드 추출: "Firebase: Error (auth/invalid-email)."
    const match = error.message.match(/\(([^)]+)\)/);
    if (match) {
      code = match[1];
    } else {
      code = error.message;
    }
  } else {
    return 'auth.errors.unknownError';
  }

  // Firebase Auth 에러 코드 매핑
  // 참고: https://firebase.google.com/docs/auth/admin/errors
  const errorKeyMap: Record<string, string> = {
    // ========================================
    // 🔐 로그인 관련 에러
    // ========================================
    
    // ✅ Firebase v10+: 잘못된 이메일/비밀번호 통합 에러
    // 보안상 이유로 wrong-password와 user-not-found를 구분하지 않음
    'auth/invalid-credential': 'auth.errors.invalidCredential',
    'auth/invalid-login-credentials': 'auth.errors.invalidCredential',
    
    // 잘못된 비밀번호 (Firebase v9 이하)
    'auth/wrong-password': 'auth.errors.wrongPassword',
    
    // 존재하지 않는 사용자 (Firebase v9 이하)
    'auth/user-not-found': 'auth.errors.userNotFound',
    
    // 비활성화된 계정
    'auth/user-disabled': 'auth.errors.userDisabled',
    
    // 너무 많은 로그인 시도
    'auth/too-many-requests': 'auth.errors.tooManyRequests',
    
    // ========================================
    // 📧 이메일 관련 에러
    // ========================================
    
    // 잘못된 이메일 형식
    'auth/invalid-email': 'auth.errors.invalidEmailFormat',
    
    // 이미 사용 중인 이메일
    'auth/email-already-in-use': 'auth.errors.emailInUse',
    
    // 이메일이 이미 다른 인증 방법과 연결됨
    'auth/account-exists-with-different-credential': 'auth.errors.accountExistsWithDifferentCredential',
    
    // ========================================
    // 🔑 비밀번호 관련 에러
    // ========================================
    
    // 약한 비밀번호
    'auth/weak-password': 'auth.errors.weakPassword',
    
    // 재인증 필요 (비밀번호 변경 등)
    'auth/requires-recent-login': 'auth.errors.recentLoginRequired',
    
    // ========================================
    // 🌐 소셜 로그인 관련 에러
    // ========================================
    
    // 팝업이 사용자에 의해 닫힘
    'auth/popup-closed-by-user': 'auth.errors.popupClosed',
    
    // 이전 팝업 요청이 취소됨
    'auth/cancelled-popup-request': 'auth.errors.popupCancelled',
    
    // 팝업이 차단됨
    'auth/popup-blocked': 'auth.errors.popupBlocked',
    
    // 리다이렉트 작업 진행 중
    'auth/redirect-operation-pending': 'auth.errors.redirectPending',
    
    // ========================================
    // 🚫 권한 및 설정 에러
    // ========================================
    
    // 허용되지 않은 작업 (관리자가 비활성화)
    'auth/operation-not-allowed': 'auth.errors.operationNotAllowed',
    
    // 인증되지 않은 도메인
    'auth/unauthorized-domain': 'auth.errors.unauthorizedDomain',
    
    // ========================================
    // 🔗 네트워크 에러
    // ========================================
    
    // 네트워크 요청 실패
    'auth/network-request-failed': 'auth.errors.networkError',
    
    // 서버 응답 시간 초과
    'auth/timeout': 'auth.errors.timeout',
    
    // ========================================
    // 📱 기타 에러
    // ========================================
    
    // 잘못된 API 키
    'auth/invalid-api-key': 'auth.errors.invalidApiKey',
    
    // 앱이 삭제됨
    'auth/app-deleted': 'auth.errors.appDeleted',
    
    // 인자가 잘못됨
    'auth/argument-error': 'auth.errors.argumentError',
    
    // 잘못된 사용자 토큰
    'auth/invalid-user-token': 'auth.errors.invalidUserToken',
    
    // 사용자 토큰 만료
    'auth/user-token-expired': 'auth.errors.userTokenExpired',
    
    // 웹 저장소 지원 안 됨
    'auth/web-storage-unsupported': 'auth.errors.webStorageUnsupported',
    
    // 이미 초기화됨
    'auth/already-initialized': 'auth.errors.alreadyInitialized',
  };

  return errorKeyMap[code] || 'auth.errors.unknownError';
}

/**
 * Firebase Auth 에러를 번역된 메시지로 변환
 * 
 * @param error - Firebase Auth 에러 객체
 * @param t - useTranslation의 t 함수
 * @returns 번역된 에러 메시지
 * 
 * @example
 * ```tsx
 * import { translateAuthError } from '@/lib/auth-errors';
 * import { useTranslation } from '@/hooks/useTranslation';
 * 
 * const { t } = useTranslation();
 * 
 * try {
 *   await signInWithEmail(email, password);
 * } catch (error) {
 *   const errorMessage = translateAuthError(error, t);
 *   showError(errorMessage);
 * }
 * ```
 */
export function translateAuthError(
  error: unknown,
  t: (key: string) => string
): string {
  const errorKey = getAuthErrorKey(error);
  return t(errorKey);
}

/**
 * 에러 코드에 따른 에러 타입 분류
 * UI에서 에러 유형에 따라 다른 처리를 할 때 유용
 * 
 * @param error - Firebase Auth 에러 객체
 * @returns 에러 타입
 */
export type AuthErrorType = 
  | 'credential'   // 이메일/비밀번호 관련
  | 'email'        // 이메일 형식/중복 관련
  | 'password'     // 비밀번호 강도 관련
  | 'network'      // 네트워크 관련
  | 'popup'        // 소셜 로그인 팝업 관련
  | 'permission'   // 권한 관련
  | 'unknown';     // 알 수 없음

export function getAuthErrorType(error: unknown): AuthErrorType {
  let code: string;

  if (typeof error === 'string') {
    code = error;
  } else if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    code = error.code;
  } else {
    return 'unknown';
  }

  // 에러 타입 분류
  const credentialErrors = [
    'auth/invalid-credential',
    'auth/invalid-login-credentials',
    'auth/wrong-password',
    'auth/user-not-found',
    'auth/user-disabled',
    'auth/too-many-requests',
  ];

  const emailErrors = [
    'auth/invalid-email',
    'auth/email-already-in-use',
    'auth/account-exists-with-different-credential',
  ];

  const passwordErrors = [
    'auth/weak-password',
    'auth/requires-recent-login',
  ];

  const networkErrors = [
    'auth/network-request-failed',
    'auth/timeout',
  ];

  const popupErrors = [
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/popup-blocked',
    'auth/redirect-operation-pending',
  ];

  const permissionErrors = [
    'auth/operation-not-allowed',
    'auth/unauthorized-domain',
  ];

  if (credentialErrors.includes(code)) return 'credential';
  if (emailErrors.includes(code)) return 'email';
  if (passwordErrors.includes(code)) return 'password';
  if (networkErrors.includes(code)) return 'network';
  if (popupErrors.includes(code)) return 'popup';
  if (permissionErrors.includes(code)) return 'permission';

  return 'unknown';
}