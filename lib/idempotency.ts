// lib/idempotency.ts
import { getAdminFirestore } from './firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Idempotency helper for preventing duplicate API requests
 *
 * Uses Firestore transactions to ensure atomic check-and-set operations
 */

export interface IdempotencyKeyData {
  key: string;
  userId: string;
  operation: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  result?: unknown;
}

/**
 * Check if an idempotency key has been used before
 * If not, mark it as used atomically
 *
 * @param key - Unique idempotency key (e.g., UUID from client or generated hash)
 * @param userId - User ID for scoping
 * @param operation - Operation name (e.g., 'subscription.sync', 'subscription.resume')
 * @param ttlMinutes - How long to keep the key (default: 60 minutes)
 * @returns true if this is the first time seeing this key, false if duplicate
 */
export async function tryClaimIdempotencyKey(
  key: string,
  userId: string,
  operation: string,
  ttlMinutes: number = 60
): Promise<boolean> {
  const db = getAdminFirestore();
  const keyRef = db.collection('idempotency_keys').doc(key);

  try {
    const claimed = await db.runTransaction(async (transaction) => {
      const keyDoc = await transaction.get(keyRef);

      // Key already exists - this is a duplicate request
      if (keyDoc.exists) {
        const data = keyDoc.data() as IdempotencyKeyData;
        console.log(`⚠️ Duplicate request detected: ${operation} for user ${userId}`);
        console.log(`   Original request at: ${data.createdAt.toDate().toISOString()}`);
        return false;
      }

      // First time seeing this key - claim it
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + ttlMinutes * 60 * 1000
      );

      transaction.set(keyRef, {
        key,
        userId,
        operation,
        createdAt: now,
        expiresAt,
      });

      return true;
    });

    if (claimed) {
      console.log(`✅ Idempotency key claimed: ${key} for ${operation}`);
    }

    return claimed;
  } catch (error) {
    console.error('Error checking idempotency key:', error);
    // On error, allow the operation (fail open)
    // This prevents temporary Firestore issues from blocking all requests
    return true;
  }
}

/**
 * Store the result of an idempotent operation
 * This allows returning the same result for duplicate requests
 */
export async function storeIdempotencyResult(
  key: string,
  result: unknown
): Promise<void> {
  const db = getAdminFirestore();
  const keyRef = db.collection('idempotency_keys').doc(key);

  try {
    await keyRef.update({
      result,
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Stored idempotency result for key: ${key}`);
  } catch (error) {
    console.error('Error storing idempotency result:', error);
    // Non-critical, just log the error
  }
}

/**
 * Get the cached result for an idempotency key
 */
export async function getIdempotencyResult(
  key: string
): Promise<unknown | null> {
  const db = getAdminFirestore();
  const keyRef = db.collection('idempotency_keys').doc(key);

  try {
    const keyDoc = await keyRef.get();
    if (!keyDoc.exists) {
      return null;
    }

    const data = keyDoc.data() as IdempotencyKeyData;
    return data.result || null;
  } catch (error) {
    console.error('Error getting idempotency result:', error);
    return null;
  }
}

/**
 * Clean up expired idempotency keys (run periodically)
 */
export async function cleanupExpiredIdempotencyKeys(): Promise<number> {
  const db = getAdminFirestore();
  const now = Timestamp.now();

  try {
    const expiredKeys = await db
      .collection('idempotency_keys')
      .where('expiresAt', '<=', now)
      .limit(500)
      .get();

    if (expiredKeys.empty) {
      return 0;
    }

    const batch = db.batch();
    expiredKeys.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️ Cleaned up ${expiredKeys.size} expired idempotency keys`);
    return expiredKeys.size;
  } catch (error) {
    console.error('Error cleaning up idempotency keys:', error);
    throw error;
  }
}
