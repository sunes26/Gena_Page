// lib/paddle-validation.ts
/**
 * Zod schemas for Paddle API response validation
 * Provides runtime type safety for all Paddle API responses
 */

import { z } from 'zod';

/**
 * Paddle Subscription Schema
 */
export const PaddleSubscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'paused', 'trialing']),
  customer_id: z.string(),
  custom_data: z.record(z.string(), z.unknown()).nullable().optional(),
  current_billing_period: z.object({
    starts_at: z.string(),
    ends_at: z.string(),
  }),
  next_billed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  scheduled_change: z
    .object({
      action: z.enum(['cancel', 'pause', 'resume']),
      effective_at: z.string(),
      resume_at: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  items: z.array(
    z.object({
      status: z.string().optional(),
      quantity: z.number(),
      recurring: z.boolean().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
      previously_billed_at: z.string().nullable().optional(),
      next_billed_at: z.string().nullable().optional(),
      trial_dates: z.unknown().nullable().optional(),
      price: z
        .object({
          id: z.string(),
          unit_price: z.object({
            amount: z.string(),
            currency_code: z.string(),
          }),
        })
        .passthrough(), // Allow additional fields
      product: z.unknown().optional(), // Product info
    })
  ),
});

export type PaddleSubscription = z.infer<typeof PaddleSubscriptionSchema>;

/**
 * Paddle Transaction Schema
 */
export const PaddleTransactionSchema = z.object({
  id: z.string(),
  status: z.string(),
  checkout: z
    .object({
      url: z.string().nullable(),
    })
    .nullable()
    .optional(),
  customer_id: z.string().nullable(),
  created_at: z.string(),
  custom_data: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type PaddleTransaction = z.infer<typeof PaddleTransactionSchema>;

/**
 * Paddle API Response Wrapper Schema
 */
export const PaddleAPIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    meta: z
      .object({
        request_id: z.string().optional(),
        pagination: z
          .object({
            per_page: z.number(),
            next: z.string().optional(),
            has_more: z.boolean(),
            estimated_total: z.number(),
          })
          .optional(),
      })
      .optional(),
  });

/**
 * Validate Paddle API response
 *
 * @param schema - Zod schema to validate against
 * @param data - Response data from Paddle API
 * @param context - Context string for error messages
 * @returns Validated and typed data
 * @throws Error if validation fails
 */
export function validatePaddleResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  context: string = 'Paddle API response'
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ ${context} validation failed:`, result.error.format());
    console.error('Received data:', JSON.stringify(data, null, 2));

    // Log specific validation errors
    const errors = result.error.issues;
    errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });

    throw new Error(
      `${context} validation failed: ${errors[0]?.message || 'Invalid data structure'}`
    );
  }

  return result.data;
}

/**
 * Safely validate Paddle API response without throwing
 *
 * @param schema - Zod schema to validate against
 * @param data - Response data from Paddle API
 * @returns Success object with data or error object
 */
export function safeValidatePaddleResponse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}

/**
 * Update payment method URL response schema
 * Paddle API returns 'id' not 'transaction_id'
 */
export const UpdatePaymentMethodResponseSchema = z.object({
  data: z.object({
    id: z.string(), // Transaction ID
    subscription_id: z.string(),
    status: z.string().optional(),
    checkout: z.object({
      url: z.string().url(),
    }),
  }),
});

/**
 * List of subscriptions response schema
 */
export const SubscriptionListResponseSchema = PaddleAPIResponseSchema(
  z.array(PaddleSubscriptionSchema)
);

/**
 * Single subscription response schema
 */
export const SubscriptionResponseSchema = PaddleAPIResponseSchema(
  PaddleSubscriptionSchema
);

/**
 * Transaction response schema
 */
export const TransactionResponseSchema = PaddleAPIResponseSchema(
  PaddleTransactionSchema
);

/**
 * Customer subscriptions response schema
 */
export const CustomerSubscriptionsResponseSchema = PaddleAPIResponseSchema(
  z.array(PaddleSubscriptionSchema)
);
