// lib/firebase/admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Admin SDK 설정 타입
interface AdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Private Key 파싱 및 정리
 * Vercel 환경 변수에서 가져온 키를 안전하게 처리
 */
const parsePrivateKey = (rawKey: string): string => {
  // 1. 앞뒤 공백 제거
  let key = rawKey.trim();

  // 2. 따옴표 제거 (있다면)
  if ((key.startsWith('"') && key.endsWith('"')) || 
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // 3. 이스케이프된 줄바꿈을 실제 줄바꿈으로 변환
  key = key.replace(/\\n/g, '\n');

  // 4. 키 유효성 검증
  if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) {
    throw new Error(
      'Invalid private key format. ' +
      'Key must contain BEGIN PRIVATE KEY and END PRIVATE KEY markers.'
    );
  }

  return key;
};

/**
 * 환경 변수에서 Admin SDK 설정 가져오기
 */
const getAdminConfig = (): AdminConfig => {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  // 환경 변수 존재 여부 확인
  if (!projectId || !clientEmail || !privateKeyRaw) {
    const missing = [];
    if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
    if (!privateKeyRaw) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

    throw new Error(
      `Missing Firebase Admin SDK credentials: ${missing.join(', ')}\n` +
      'Please check your environment variables in Vercel Dashboard.'
    );
  }

  // Private Key 파싱
  let privateKey: string;
  try {
    privateKey = parsePrivateKey(privateKeyRaw);
  } catch (error) {
    console.error('Private key parsing error:', error);
    throw new Error(
      'Failed to parse FIREBASE_ADMIN_PRIVATE_KEY. ' +
      'Please ensure the key is properly formatted in Vercel environment variables. ' +
      'Remove any surrounding quotes and use \\n for line breaks.'
    );
  }

  // 디버그 정보 (민감한 정보는 제외)
  if (process.env.NODE_ENV === 'development') {
    console.log('📋 Firebase Admin Config:');
    console.log('  Project ID:', projectId);
    console.log('  Client Email:', clientEmail);
    console.log('  Private Key Length:', privateKey.length);
    console.log('  Private Key Format:', 
      privateKey.includes('BEGIN PRIVATE KEY') ? '✅ Valid' : '❌ Invalid'
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
};

/**
 * Firebase Admin 앱 초기화 (싱글톤)
 */
let adminApp: App;

export const initializeAdmin = (): App => {
  // 이미 초기화된 앱이 있는지 확인
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  
  // 기존 앱이 있으면 재사용
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Using existing Firebase Admin instance');
    }
    return adminApp;
  }

  // 새로운 Admin 앱 초기화
  try {
    const config = getAdminConfig();

    adminApp = initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
      projectId: config.projectId,
    });

    console.log('✅ Firebase Admin initialized successfully');
    console.log('   Project:', config.projectId);
    
    return adminApp;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    
    // 더 자세한 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes('DECODER')) {
        throw new Error(
          'Private key decoding failed. ' +
          'This usually means the key format is incorrect. ' +
          'In Vercel, remove quotes from FIREBASE_ADMIN_PRIVATE_KEY and ensure \\n is used for line breaks.'
        );
      }
      throw error;
    }
    
    throw new Error(`Failed to initialize Firebase Admin: ${error}`);
  }
};

/**
 * Admin Auth 인스턴스 가져오기
 */
let adminAuth: Auth;

export const getAdminAuth = (): Auth => {
  if (!adminAuth) {
    const app = initializeAdmin();
    adminAuth = getAuth(app);
  }
  return adminAuth;
};

/**
 * Admin Firestore 인스턴스 가져오기
 */
let adminDb: Firestore;

export const getAdminFirestore = (): Firestore => {
  if (!adminDb) {
    const app = initializeAdmin();
    adminDb = getFirestore(app);
    
    // Firestore 설정
    adminDb.settings({
      ignoreUndefinedProperties: true,
    });
  }
  return adminDb;
};

/**
 * 특정 컬렉션 참조 헬퍼 함수
 */
export const getCollection = (collectionName: string) => {
  const db = getAdminFirestore();
  return db.collection(collectionName);
};

/**
 * users 컬렉션 참조
 */
export const getUsersCollection = () => {
  return getCollection('users');
};

/**
 * subscription 컬렉션 참조
 */
export const getSubscriptionCollection = () => {
  return getCollection('subscription');
};

/**
 * webhook_events 컬렉션 참조
 */
export const getWebhookEventsCollection = () => {
  return getCollection('webhook_events');
};

// Export instances
export { adminApp, adminAuth, adminDb };

// 기본 export
export default {
  app: initializeAdmin,
  auth: getAdminAuth,
  db: getAdminFirestore,
};