/**
 * Environment Variable Validation
 *
 * 빌드 시 필수 환경변수를 검증하여 런타임 에러를 방지합니다.
 * Zod를 사용한 타입 안전한 환경변수 관리
 */

import { z } from 'zod';

// ============================================
// Client-side Environment Variables (NEXT_PUBLIC_*)
// ============================================
const clientSchema = z.object({
  // Firebase Client
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase Messaging Sender ID is required'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, 'Firebase App ID is required'),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url('App URL must be a valid URL'),

  // Paddle Client
  NEXT_PUBLIC_PADDLE_ENVIRONMENT: z.enum(['sandbox', 'production']),
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z
    .string()
    .min(1, 'Paddle Client Token is required')
    .refine(
      (val) => val.startsWith('test_') || val.startsWith('live_'),
      'Paddle Client Token must start with "test_" or "live_"'
    ),
  NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY: z
    .string()
    .min(1, 'Paddle Pro Monthly Price ID is required')
    .startsWith('pri_', 'Paddle Price ID must start with "pri_"'),

  // Optional: Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
});

// ============================================
// Server-side Environment Variables
// ============================================
const serverSchema = z.object({
  // Firebase Admin (Accept both FIREBASE_* and FIREBASE_ADMIN_* for backwards compatibility)
  FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required').optional(),
  FIREBASE_CLIENT_EMAIL: z
    .string()
    .email('Firebase Client Email must be a valid email')
    .includes('gserviceaccount.com', { message: 'Must be a Firebase service account email' })
    .optional(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1, 'Firebase Private Key is required')
    .includes('BEGIN PRIVATE KEY', { message: 'Must be a valid private key' })
    .optional(),
  // Legacy names for backwards compatibility
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1, 'Firebase Admin Project ID is required').optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z
    .string()
    .email('Firebase Admin Client Email must be a valid email')
    .includes('gserviceaccount.com', { message: 'Must be a Firebase service account email' })
    .optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z
    .string()
    .min(1, 'Firebase Admin Private Key is required')
    .includes('BEGIN PRIVATE KEY', { message: 'Must be a valid private key' })
    .optional(),

  // Session
  SESSION_COOKIE_NAME: z.string().default('__session'),
  SESSION_MAX_AGE: z.string().default('604800').transform(Number).pipe(z.number().positive()),

  // Paddle Server
  PADDLE_API_KEY: z
    .string()
    .min(1, 'Paddle API Key is required')
    .refine(
      (val) => val.startsWith('pdl_sdbx_') || val.startsWith('pdl_live_'),
      'Paddle API Key must start with "pdl_sdbx_" or "pdl_live_"'
    ),
  PADDLE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'Paddle Webhook Secret is required')
    .startsWith('pdl_ntfset_', 'Paddle Webhook Secret must start with "pdl_ntfset_"'),

  // Cron
  CRON_SECRET: z
    .string()
    .min(16, 'Cron secret must be at least 16 characters')
    .refine(
      (val) => val !== 'your_random_secret_string_here',
      'Cron secret must be changed from the example value'
    ),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),

  // Optional: External Services
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional().or(z.literal('')),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

// ============================================
// Combined Schema
// ============================================
const envSchema = clientSchema.merge(serverSchema);

// ============================================
// Validate and Export
// ============================================

/**
 * Validated environment variables
 * 타입 안전한 환경변수 객체
 */
export const env = (() => {
  try {
    // Parse and validate
    const parsed = envSchema.parse(process.env);

    // Ensure at least one set of Firebase credentials is provided
    const hasNewFormat = parsed.FIREBASE_PROJECT_ID && parsed.FIREBASE_CLIENT_EMAIL && parsed.FIREBASE_PRIVATE_KEY;
    const hasLegacyFormat = parsed.FIREBASE_ADMIN_PROJECT_ID && parsed.FIREBASE_ADMIN_CLIENT_EMAIL && parsed.FIREBASE_ADMIN_PRIVATE_KEY;

    if (!hasNewFormat && !hasLegacyFormat) {
      throw new Error(
        'Firebase credentials are required. Please set either:\n' +
        '  - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n' +
        '  OR\n' +
        '  - FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
      );
    }

    // Additional cross-field validations
    validatePaddleEnvironmentConsistency(parsed);

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:\n');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n📝 Please check your .env.local file and ensure all required variables are set correctly.\n');
    } else if (error instanceof Error) {
      console.error('❌ ' + error.message);
    }
    throw new Error('Invalid environment variables');
  }
})();

/**
 * Validate Paddle environment consistency
 * Paddle 환경 설정의 일관성 검증
 */
function validatePaddleEnvironmentConsistency(config: z.infer<typeof envSchema>) {
  const isSandbox = config.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox';
  const hasTestToken = config.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.startsWith('test_');
  const hasSandboxApiKey = config.PADDLE_API_KEY.startsWith('pdl_sdbx_');

  if (isSandbox) {
    if (!hasTestToken) {
      throw new Error(
        'Paddle environment is "sandbox" but client token does not start with "test_". ' +
        'Please use a sandbox client token or change environment to "production".'
      );
    }
    if (!hasSandboxApiKey) {
      throw new Error(
        'Paddle environment is "sandbox" but API key does not start with "pdl_sdbx_". ' +
        'Please use a sandbox API key or change environment to "production".'
      );
    }
  } else {
    // production
    if (hasTestToken) {
      throw new Error(
        'Paddle environment is "production" but client token starts with "test_". ' +
        'Please use a live client token or change environment to "sandbox".'
      );
    }
    if (hasSandboxApiKey) {
      throw new Error(
        'Paddle environment is "production" but API key starts with "pdl_sdbx_". ' +
        'Please use a live API key or change environment to "sandbox".'
      );
    }
  }
}

/**
 * Client-safe environment variables
 * 클라이언트에서 안전하게 사용 가능한 환경변수만 포함
 */
export const clientEnv = {
  FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  APP_URL: env.NEXT_PUBLIC_APP_URL,
  PADDLE_ENVIRONMENT: env.NEXT_PUBLIC_PADDLE_ENVIRONMENT,
  PADDLE_CLIENT_TOKEN: env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
  PADDLE_PRICE_PRO_MONTHLY: env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY,
  GA_MEASUREMENT_ID: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  GTM_ID: env.NEXT_PUBLIC_GTM_ID,
  SENTRY_DSN: env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

/**
 * Type for validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if Paddle is in production mode
 */
export const isPaddleProduction = env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production';
