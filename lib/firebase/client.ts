// lib/firebase/client.ts
// ✅ Tree Shaking 최적화: 필요한 함수만 import
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase 설정 타입
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// 환경 변수 검증
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 필수 환경 변수 확인
const validateConfig = (config: FirebaseConfig): void => {
  const requiredKeys: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter((key) => !config[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Firebase configuration: ${missingKeys.join(', ')}\n` +
      'Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.'
    );
  }
};

// Firebase 초기화 (싱글톤 패턴)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

/**
 * Firebase 앱 초기화
 * 이미 초기화된 경우 기존 인스턴스 반환
 */
export const initializeFirebase = (): FirebaseApp => {
  // 개발 환경에서만 설정 검증
  if (process.env.NODE_ENV === 'development') {
    validateConfig(firebaseConfig);
  }

  // 이미 초기화된 앱이 있는지 확인 (싱글톤)
  if (!app) {
    const apps = getApps();
    
    if (apps.length === 0) {
      app = initializeApp(firebaseConfig);
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Firebase initialized successfully');
      }
    } else {
      app = apps[0];
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Using existing Firebase instance');
      }
    }
  }

  return app;
};

/**
 * Firebase Authentication 인스턴스 가져오기
 * ✅ 지연 초기화: 필요할 때만 생성
 */
export const getAuthInstance = (): Auth => {
  if (!auth) {
    const firebaseApp = initializeFirebase();
    auth = getAuth(firebaseApp);
  }
  return auth;
};

/**
 * Firestore 인스턴스 가져오기
 * ✅ 지연 초기화: 필요할 때만 생성
 */
export const getFirestoreInstance = (): Firestore => {
  if (!db) {
    const firebaseApp = initializeFirebase();
    db = getFirestore(firebaseApp);
  }
  return db;
};

/**
 * Firebase Storage 인스턴스 가져오기
 * ✅ 지연 초기화: 필요할 때만 생성
 */
export const getStorageInstance = (): FirebaseStorage => {
  if (!storage) {
    const firebaseApp = initializeFirebase();
    storage = getStorage(firebaseApp);
  }
  return storage;
};

/**
 * ✅ 인스턴스 정리 함수 (테스트 용도)
 */
export const cleanupFirebaseInstances = (): void => {
  app = undefined;
  auth = undefined;
  db = undefined;
  storage = undefined;
};

// 기본 export (하위 호환성)
const firebaseClient = {
  get app() { return initializeFirebase(); },
  get auth() { return getAuthInstance(); },
  get db() { return getFirestoreInstance(); },
  get storage() { return getStorageInstance(); },
};

export default firebaseClient;