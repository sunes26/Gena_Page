// lib/paddle-errors.ts
/**
 * Paddle 에러 메시지 한국어 변환
 */

/**
 * Paddle 에러 코드별 한국어 메시지 매핑
 */
const PADDLE_ERROR_MESSAGES: Record<string, string> = {
  // 카드 관련 에러
  'card_declined': '카드가 거절되었습니다. 다른 카드를 사용하거나 은행에 문의해주세요.',
  'insufficient_funds': '잔액이 부족합니다. 충분한 잔액이 있는 카드를 사용해주세요.',
  'expired_card': '카드가 만료되었습니다. 유효한 카드를 사용해주세요.',
  'incorrect_cvc': 'CVC 번호가 올바르지 않습니다. 카드 뒷면의 3자리 또는 4자리 번호를 확인해주세요.',
  'invalid_card_number': '카드 번호가 올바르지 않습니다. 다시 확인해주세요.',
  'processing_error': '결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 인증 관련 에러
  'authentication_required': '추가 인증이 필요합니다. 카드사의 인증 절차를 완료해주세요.',
  'authentication_failed': '카드 인증에 실패했습니다. 다시 시도하거나 다른 카드를 사용해주세요.',

  // 네트워크/시스템 에러
  'network_error': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.',
  'timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  'server_error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 결제 수단 관련
  'payment_method_not_available': '선택하신 결제 수단을 사용할 수 없습니다. 다른 결제 수단을 선택해주세요.',
  'payment_method_required': '결제 수단을 선택해주세요.',

  // 구독 관련
  'subscription_already_exists': '이미 활성화된 구독이 있습니다.',
  'subscription_not_found': '구독 정보를 찾을 수 없습니다.',
  'subscription_locked_pending_changes': '구독이 잠겨 있습니다. 대기 중인 변경 사항을 처리해주세요.',

  // 가격/플랜 관련
  'price_not_found': '선택하신 플랜을 찾을 수 없습니다. 페이지를 새로고침하고 다시 시도해주세요.',
  'invalid_price': '유효하지 않은 가격 정보입니다. 관리자에게 문의해주세요.',

  // 사용자 관련
  'customer_not_found': '고객 정보를 찾을 수 없습니다.',
  'invalid_customer': '유효하지 않은 고객 정보입니다.',

  // 일반 에러
  'unknown_error': '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'validation_error': '입력하신 정보가 올바르지 않습니다. 다시 확인해주세요.',
};

/**
 * ✅ Paddle 에러를 한국어로 변환
 *
 * @param error - Paddle 에러 객체 또는 에러 메시지
 * @returns 한국어 에러 메시지
 */
export function getPaddleErrorMessage(error: unknown): string {
  // Error 객체인 경우
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // 에러 메시지에서 키워드 찾기
    for (const [key, message] of Object.entries(PADDLE_ERROR_MESSAGES)) {
      if (errorMessage.includes(key.toLowerCase()) ||
          errorMessage.includes(key.replace('_', ' '))) {
        return message;
      }
    }

    // 특정 패턴 매칭
    if (errorMessage.includes('card') && errorMessage.includes('declined')) {
      return PADDLE_ERROR_MESSAGES.card_declined;
    }
    if (errorMessage.includes('insufficient')) {
      return PADDLE_ERROR_MESSAGES.insufficient_funds;
    }
    if (errorMessage.includes('expired')) {
      return PADDLE_ERROR_MESSAGES.expired_card;
    }
    if (errorMessage.includes('cvc') || errorMessage.includes('cvv')) {
      return PADDLE_ERROR_MESSAGES.incorrect_cvc;
    }
    if (errorMessage.includes('network')) {
      return PADDLE_ERROR_MESSAGES.network_error;
    }
    if (errorMessage.includes('timeout')) {
      return PADDLE_ERROR_MESSAGES.timeout;
    }

    // 원본 메시지가 의미 있는 경우 반환
    if (error.message.length > 10 && error.message.length < 100) {
      return `결제 오류: ${error.message}`;
    }
  }

  // 문자열인 경우
  if (typeof error === 'string') {
    const errorLower = error.toLowerCase();

    for (const [key, message] of Object.entries(PADDLE_ERROR_MESSAGES)) {
      if (errorLower.includes(key.toLowerCase())) {
        return message;
      }
    }

    if (error.length > 10 && error.length < 100) {
      return `결제 오류: ${error}`;
    }
  }

  // 기본 에러 메시지
  return PADDLE_ERROR_MESSAGES.unknown_error;
}

/**
 * ✅ 에러 타입에 따른 사용자 액션 가이드
 *
 * @param error - Paddle 에러 객체
 * @returns 사용자가 취할 수 있는 액션 가이드
 */
export function getPaddleErrorAction(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (errorMessage.includes('card') || errorMessage.includes('declined') || errorMessage.includes('insufficient')) {
    return '다른 결제 수단을 사용하거나 은행에 문의해주세요.';
  }

  if (errorMessage.includes('expired')) {
    return '유효기간이 지나지 않은 카드를 사용해주세요.';
  }

  if (errorMessage.includes('cvc') || errorMessage.includes('cvv')) {
    return '카드 뒷면의 보안 코드를 정확히 입력해주세요.';
  }

  if (errorMessage.includes('authentication')) {
    return '카드사 앱에서 인증을 완료한 후 다시 시도해주세요.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
    return '인터넷 연결을 확인하고 잠시 후 다시 시도해주세요.';
  }

  return '문제가 지속되면 고객센터로 문의해주세요.';
}

/**
 * ✅ 완전한 에러 메시지 (메시지 + 액션)
 *
 * @param error - Paddle 에러 객체
 * @returns 에러 메시지와 액션 가이드를 포함한 완전한 메시지
 */
export function getFullPaddleErrorMessage(error: unknown): string {
  const message = getPaddleErrorMessage(error);
  const action = getPaddleErrorAction(error);

  return `${message}\n\n${action}`;
}
