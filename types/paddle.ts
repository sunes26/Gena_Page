// types/paddle.ts
/**
 * Paddle Billing 타입 정의
 */

/**
 * Paddle 구독 상태
 */
export type PaddleSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'paused'
  | 'trialing';

/**
 * Paddle 트랜잭션 상태
 */
export type PaddleTransactionStatus =
  | 'draft'
  | 'ready'
  | 'billed'
  | 'paid'
  | 'completed'
  | 'canceled';

/**
 * Paddle 구독 정보
 */
export interface PaddleSubscription {
  id: string;
  status: PaddleSubscriptionStatus;
  customer_id: string;
  address_id: string | null;
  business_id: string | null;
  custom_data: Record<string, any>;
  currency_code: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  first_billed_at: string | null;
  next_billed_at: string | null;
  paused_at: string | null;
  canceled_at: string | null;
  discount: any | null;
  collection_mode: 'automatic' | 'manual';
  billing_details: {
    enable_checkout: boolean;
    payment_terms: {
      interval: string;
      frequency: number;
    };
    purchase_order_number: string | null;
  };
  current_billing_period: {
    starts_at: string;
    ends_at: string;
  };
  billing_cycle: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  };
  scheduled_change: {
    action: 'cancel' | 'pause' | 'resume';
    effective_at: string;
    resume_at: string | null;
  } | null;
  items: Array<{
    price_id: string;
    quantity: number;
    status: 'active' | 'inactive' | 'trialing';
    created_at: string;
    updated_at: string;
    previously_billed_at: string | null;
    next_billed_at: string | null;
    trial_dates: {
      starts_at: string;
      ends_at: string;
    } | null;
  }>;
  management_urls: {
    update_payment_method: string;
    cancel: string;
  };
}

/**
 * Paddle 트랜잭션 (Checkout)
 */
export interface PaddleTransaction {
  id: string;
  status: PaddleTransactionStatus;
  customer_id: string | null;
  address_id: string | null;
  business_id: string | null;
  custom_data: Record<string, any>;
  currency_code: string;
  origin: 'api' | 'subscription_charge' | 'subscription_payment_method_change';
  subscription_id: string | null;
  invoice_id: string | null;
  invoice_number: string | null;
  collection_mode: 'automatic' | 'manual';
  discount_id: string | null;
  billing_details: any;
  billing_period: {
    starts_at: string;
    ends_at: string;
  } | null;
  items: Array<{
    price_id: string;
    quantity: number;
    proration: any | null;
  }>;
  details: {
    totals: {
      subtotal: string;
      discount: string;
      tax: string;
      total: string;
      credit: string;
      balance: string;
      grand_total: string;
      fee: string | null;
      earnings: string | null;
      currency_code: string;
    };
    adjusted_totals: {
      subtotal: string;
      tax: string;
      total: string;
      grand_total: string;
      fee: string;
      earnings: string;
      currency_code: string;
    };
    payout_totals: any | null;
    tax_rates_used: Array<{
      tax_rate: string;
      totals: {
        subtotal: string;
        discount: string;
        tax: string;
        total: string;
      };
    }>;
    line_items: Array<{
      id: string;
      price_id: string;
      quantity: number;
      proration: any | null;
      tax_rate: string;
      unit_totals: {
        subtotal: string;
        discount: string;
        tax: string;
        total: string;
      };
      totals: {
        subtotal: string;
        discount: string;
        tax: string;
        total: string;
      };
      product: {
        id: string;
        name: string;
        description: string;
        tax_category: string;
        image_url: string;
        custom_data: Record<string, any>;
        status: 'active' | 'archived';
      };
    }>;
  };
  payments: Array<any>;
  checkout: {
    url: string | null;
  };
  created_at: string;
  updated_at: string;
  billed_at: string | null;
}

/**
 * Paddle 고객 정보
 */
export interface PaddleCustomer {
  id: string;
  name: string | null;
  email: string;
  status: 'active' | 'archived';
  custom_data: Record<string, any>;
  locale: string;
  created_at: string;
  updated_at: string;
  import_meta: any | null;
}

/**
 * Paddle 가격 정보
 */
export interface PaddlePrice {
  id: string;
  product_id: string;
  description: string;
  type: 'standard' | 'custom';
  name: string | null;
  billing_cycle: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  } | null;
  trial_period: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
  } | null;
  tax_mode: 'account_setting' | 'external' | 'internal';
  unit_price: {
    amount: string;
    currency_code: string;
  };
  unit_price_overrides: Array<any>;
  quantity: {
    minimum: number;
    maximum: number;
  };
  status: 'active' | 'archived';
  custom_data: Record<string, any>;
  import_meta: any | null;
  created_at: string;
  updated_at: string;
}

/**
 * Paddle Webhook Event
 */
export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: any;
}

/**
 * Paddle Webhook - Subscription Created
 */
export interface PaddleSubscriptionCreatedEvent extends PaddleWebhookEvent {
  event_type: 'subscription.created';
  data: PaddleSubscription;
}

/**
 * Paddle Webhook - Subscription Updated
 */
export interface PaddleSubscriptionUpdatedEvent extends PaddleWebhookEvent {
  event_type: 'subscription.updated';
  data: PaddleSubscription;
}

/**
 * Paddle Webhook - Subscription Canceled
 */
export interface PaddleSubscriptionCanceledEvent extends PaddleWebhookEvent {
  event_type: 'subscription.canceled';
  data: PaddleSubscription;
}

/**
 * Paddle Webhook - Transaction Completed
 */
export interface PaddleTransactionCompletedEvent extends PaddleWebhookEvent {
  event_type: 'transaction.completed';
  data: PaddleTransaction;
}

/**
 * Firestore Subscription 문서 (우리 DB용)
 */
export interface FirestoreSubscription {
  userId: string;
  paddleSubscriptionId: string;
  paddleCustomerId: string;
  plan: 'free' | 'pro';
  status: PaddleSubscriptionStatus;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customData?: Record<string, any>;
}

/**
 * API 응답 타입
 */
export interface CreateCheckoutResponse {
  success: boolean;
  checkoutUrl: string;
  transactionId: string;
  message: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  subscription: Partial<PaddleSubscription>;
  message: string;
}

export interface UpdatePaymentMethodResponse {
  success: boolean;
  updateUrl: string;
  message: string;
}