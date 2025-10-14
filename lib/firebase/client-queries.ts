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
  Timestamp,
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
 * 1. 사용자 히스토리 조회 (클라이언트)
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

  let q = query(
    collection(db, 'history'),
    where('userId', '==', userId),
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

  const q = query(
    collection(db, 'daily'),
    where('userId', '==', userId),
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
 */
export async function getHistoryByIdClient(
  historyId: string
): Promise<(HistoryDocument & { id: string }) | null> {
  const db = getFirestoreInstance();
  const docRef = doc(db, 'history', historyId);
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