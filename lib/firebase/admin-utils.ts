// lib/firebase/admin-utils.ts
import { getAdminAuth, getAdminFirestore } from './admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { timestampToDate } from './utils';

/**
 * Firebase ID 토큰 검증
 */
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const auth = getAdminAuth();
  return await auth.verifyIdToken(token);
}

/**
 * Authorization 헤더에서 토큰 추출 및 검증
 */
export async function verifyAuthHeader(authHeader: string | null): Promise<DecodedIdToken> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  return await verifyIdToken(token);
}

/**
 * 사용자 존재 여부 확인
 */
export async function userExists(userId: string): Promise<boolean> {
  try {
    const auth = getAdminAuth();
    await auth.getUser(userId);
    return true;
  } catch {
    return false;
  }
}

// ✅ timestampToDate는 utils.ts에서 import하여 사용
export { timestampToDate };

/**
 * 배치 삭제 (소프트 삭제)
 */
export async function softDeleteDocuments(
  collectionName: string,
  documentIds: string[]
): Promise<void> {
  const db = getAdminFirestore();
  const batch = db.batch();

  documentIds.forEach((docId) => {
    const docRef = db.collection(collectionName).doc(docId);
    batch.update(docRef, {
      deletedAt: new Date(),
    });
  });

  await batch.commit();
}