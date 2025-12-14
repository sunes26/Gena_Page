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
 * 환경 변수에서 Admin SDK 설정 가져오기
 * FIREBASE_* 또는 FIREBASE_ADMIN_* 둘 다 지원
 */
const getAdminConfig = (): AdminConfig => {
  // 두 가지 형식 모두 지원 (FIREBASE_* 우선, FIREBASE_ADMIN_* 대체)
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin SDK credentials.\n' +
      'Required environment variables (use either format):\n' +
      '  Option 1:\n' +
      '  - FIREBASE_PROJECT_ID\n' +
      '  - FIREBASE_CLIENT_EMAIL\n' +
      '  - FIREBASE_PRIVATE_KEY\n' +
      '  Option 2:\n' +
      '  - FIREBASE_ADMIN_PROJECT_ID\n' +
      '  - FIREBASE_ADMIN_CLIENT_EMAIL\n' +
      '  - FIREBASE_ADMIN_PRIVATE_KEY'
    );
  }

  return {
    projectId,
    clientEmail,
    // Private key에서 \n 이스케이프 문자를 실제 줄바꿈으로 변환
    privateKey: privateKey.replace(/\\n/g, '\n'),
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
    console.log('✅ Using existing Firebase Admin instance');
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
    return adminApp;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
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
    
    // Firestore 설정 (선택사항)
    adminDb.settings({
      ignoreUndefinedProperties: true, // undefined 값 무시
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
 * history 컬렉션 참조
 */
export const getHistoryCollection = () => {
  return getCollection('history');
};

/**
 * daily 컬렉션 참조
 */
export const getDailyCollection = () => {
  return getCollection('daily');
};

/**
 * subscription 컬렉션 참조
 */
export const getSubscriptionCollection = () => {
  return getCollection('subscription');
};

// Export instances
export { adminApp, adminAuth, adminDb };

// 기본 export
const firebaseAdmin = {
  app: initializeAdmin,
  auth: getAdminAuth,
  db: getAdminFirestore,
};

export default firebaseAdmin;