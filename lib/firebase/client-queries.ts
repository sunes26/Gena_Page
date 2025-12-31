// lib/firebase/client-queries.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { getFirestoreInstance } from './client';
import { HistoryDocument, DailyDocument } from './types';

/**
 * 쿼리 결과 타입 (클라이언트용)
 */
export interface ClientQueryResult<T> {
  data: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * ✅ NEW: 사용자 프로필 문서 생성/업데이트 (없을 경우에만 생성)
 * 로그인 시 AuthContext에서 자동 호출
 *
 * @param userId - Firebase Auth UID
 * @param email - 사용자 이메일
 * @param emailVerified - Firebase Auth의 이메일 인증 상태
 * @param displayName - 표시 이름 (선택사항)
 * @param photoURL - 프로필 사진 URL (선택사항)
 *
 * @returns Promise<void>
 */
export async function ensureUserProfile(
  userId: string,
  email: string,
  emailVerified: boolean,
  displayName?: string | null,
  photoURL?: string | null
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const userDocRef = doc(db, 'users', userId);

    // 1. 문서가 이미 존재하는지 확인
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // 2. 문서가 없으면 생성
      await setDoc(userDocRef, {
        id: userId, // ✅ Firestore 규칙에서 요구하는 id 필드
        email,
        name: displayName || email.split('@')[0],
        isPremium: false,
        subscriptionPlan: 'free',
        emailVerified, // ✅ Firebase Auth의 실제 값 사용
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // 3. 기존 문서가 있어도 일부 필드는 업데이트 (선택사항)
      // 예: email, displayName, photoURL, emailVerified가 변경되었을 수 있음
      const currentData = userDoc.data();

      // 🔍 디버깅: 현재 Firestore 데이터와 Firebase Auth 데이터 비교
      console.log('📊 ensureUserProfile - Comparing data:', {
        firestore: {
          email: currentData.email,
          emailVerified: currentData.emailVerified,
          name: currentData.name,
        },
        firebaseAuth: {
          email,
          emailVerified,
          name: displayName,
        },
      });

      const needsUpdate =
        (currentData.email !== email) || // ✅ 이메일 변경 확인
        (displayName && currentData.name !== displayName) ||
        (photoURL && currentData.photoURL !== photoURL) ||
        (currentData.emailVerified !== emailVerified); // ✅ emailVerified도 동기화

      if (needsUpdate) {
        console.log('✅ Updating Firestore user profile:', {
          email,
          emailVerified,
          name: displayName || currentData.name,
        });

        await setDoc(
          userDocRef,
          {
            email, // ✅ Firebase Auth의 최신 이메일과 동기화
            name: displayName || currentData.name,
            photoURL: photoURL || currentData.photoURL,
            emailVerified, // ✅ Firebase Auth와 동기화
            updatedAt: serverTimestamp(),
          },
          { merge: true } // 기존 데이터 유지하면서 병합
        );

        console.log('✅ Firestore user profile updated successfully');
      } else {
        console.log('ℹ️ No update needed - Firestore already in sync');
      }
    }
  } catch (error) {
    console.error('❌ Failed to ensure user profile:', error);
    throw error;
  }
}

/**
 * 1. 사용자 히스토리 조회 (클라이언트)
 * ✅ 수정: users/{userId}/history 서브컬렉션 사용
 */
export async function getUserHistoryClient(
  userId: string,
  options: {
    limit?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
  } = {}
): Promise<ClientQueryResult<HistoryDocument & { id: string }>> {
  const db = getFirestoreInstance();
  const { limit: pageSize = 20, lastDoc } = options;

  // ✅ 서브컬렉션 경로: users/{userId}/history
  let q = query(
    collection(db, 'users', userId, 'history'),
    where('deletedAt', '==', null),
    orderBy('createdAt', 'desc'),
    limit(pageSize + 1)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const docs = snapshot.docs;

  const hasMore = docs.length > pageSize;
  const data = docs.slice(0, pageSize).map((doc) => ({
    id: doc.id,
    ...(doc.data() as HistoryDocument),
  }));

  return {
    data,
    lastDoc: data.length > 0 ? docs[pageSize - 1] : null,
    hasMore,
  };
}

/**
 * 2. 최근 N일 사용량 (클라이언트)
 * ✅ 수정: users/{userId}/daily 서브컬렉션 사용
 */
export async function getRecentUsageClient(
  userId: string,
  days: number = 7
): Promise<DailyDocument[]> {
  const db = getFirestoreInstance();
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // ✅ 서브컬렉션 경로: users/{userId}/daily
  const q = query(
    collection(db, 'users', userId, 'daily'),
    where('date', '>=', formatDate(startDate)),
    where('date', '<=', formatDate(endDate)),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as DailyDocument),
  }));
}

/**
 * 3. 단일 히스토리 조회 (클라이언트)
 * ✅ 수정: users/{userId}/history 서브컬렉션 사용
 */
export async function getHistoryByIdClient(
  userId: string,
  historyId: string
): Promise<(HistoryDocument & { id: string }) | null> {
  const db = getFirestoreInstance();
  
  // ✅ 서브컬렉션 경로: users/{userId}/history/{historyId}
  const docRef = doc(db, 'users', userId, 'history', historyId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data() as HistoryDocument;

  if (data.deletedAt) {
    return null;
  }

  return {
    id: docSnap.id,
    ...data,
  };
}