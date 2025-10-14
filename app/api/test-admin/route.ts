// app/api/test-admin/route.ts
import { NextResponse } from 'next/server';
import { getAdminFirestore, getHistoryCollection, getDailyCollection } from '@/lib/firebase/admin';

export async function GET() {
  try {
    // Admin Firestore 인스턴스 확인
    const db = getAdminFirestore();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Failed to initialize Firestore' },
        { status: 500 }
      );
    }

    // history 컬렉션 테스트 (첫 5개 문서)
    const historySnapshot = await getHistoryCollection()
      .limit(5)
      .get();

    // daily 컬렉션 테스트 (첫 5개 문서)
    const dailySnapshot = await getDailyCollection()
      .limit(5)
      .get();

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working!',
      stats: {
        historyCount: historySnapshot.size,
        dailyCount: dailySnapshot.size,
      },
      sampleHistory: historySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      sampleDaily: dailySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    });
  } catch (error) {
    console.error('Admin SDK test error:', error);
    return NextResponse.json(
      {
        error: 'Admin SDK test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}