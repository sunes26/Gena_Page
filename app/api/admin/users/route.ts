// app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { verifyIdToken } from '@/lib/firebase/admin-utils';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminToken } from '@/lib/admin-auth';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  safeInternalServerErrorResponse,
} from '@/lib/api-response';

interface UserData {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  subscriptionPlan: string;
  emailVerified: boolean;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  historyCount: number;
  lastActivity: string | null;
}

/**
 * 전체 사용자 목록 조회 (관리자 전용)
 * GET /api/admin/users
 *
 * Query Parameters:
 * - filter: 'all' | 'free' | 'premium' | 'active' | 'inactive'
 * - sort: 'createdAt' | 'email' | 'historyCount' | 'lastActivity'
 * - order: 'asc' | 'desc'
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - search: string (이메일 검색)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Firebase ID 토큰 인증
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('인증 헤더가 누락되었거나 올바르지 않습니다.');
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;

    try {
      decodedToken = await verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return unauthorizedResponse('토큰이 유효하지 않거나 만료되었습니다.');
    }

    // 2. 관리자 권한 확인
    try {
      requireAdminToken(decodedToken);
    } catch (error) {
      console.error('Admin authorization failed:', {
        email: decodedToken.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return forbiddenResponse('관리자 권한이 필요합니다.');
    }

    // 3. Query Parameters 파싱
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // 4. Firestore 작업
    const db = getAdminFirestore();

    // ✅ Firestore 쿼리 빌더 (데이터베이스 레벨에서 필터링)
    let query: FirebaseFirestore.Query = db.collection('users');

    // 4-1. Premium/Free 필터 (Firestore 쿼리)
    if (filter === 'premium') {
      query = query.where('isPremium', '==', true);
    } else if (filter === 'free') {
      query = query.where('isPremium', '==', false);
    }

    // 4-2. 날짜 범위 필터 (Firestore 쿼리)
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query = query.where('createdAt', '>=', Timestamp.fromDate(start));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.where('createdAt', '<=', Timestamp.fromDate(end));
    }

    // 4-3. 이메일 검색 필터 (Firestore 쿼리 - prefix matching)
    // 참고: Firestore는 LIKE/contains를 지원하지 않으므로 prefix matching 사용
    // "john"으로 검색하면 "john@example.com"은 매칭되지만 "mary.john@example.com"은 안됨
    if (search) {
      const searchLower = search.toLowerCase();
      query = query
        .where('email', '>=', searchLower)
        .where('email', '<=', searchLower + '\uf8ff');
    }

    // 4-4. 정렬 (Firestore에서 가능한 필드만)
    // 주의: historyCount, lastActivity는 계산 필드이므로 메모리에서 정렬
    if (search) {
      // 이메일 검색 시 반드시 email로 정렬 (Firestore 제약)
      query = query.orderBy('email', order === 'asc' ? 'asc' : 'desc');
    } else if (sort === 'createdAt' || sort === 'email') {
      // createdAt, email은 Firestore에서 정렬 가능
      query = query.orderBy(sort, order === 'asc' ? 'asc' : 'desc');
    }
    // historyCount, lastActivity는 Firestore에 없으므로 메모리에서 정렬

    // 4-5. Firestore에서 데이터 가져오기 (필터링된 결과만)
    const usersSnapshot = await query.get();

    // 사용자 데이터 수집 (denormalized fields 사용 - N+1 쿼리 해결)
    const usersData: UserData[] = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // ✅ denormalized fields 사용 (historyCount, lastActivity)
      // 이 필드들은 history 생성/삭제 시 자동으로 업데이트됨
      const historyCount = userData.historyCount || 0;
      const lastActivity = userData.lastActivity instanceof Timestamp
        ? userData.lastActivity.toDate().toISOString()
        : null;

      // 활동 필터
      if (filter === 'active') {
        // 최근 30일 이내 활동
        if (!lastActivity) continue;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (new Date(lastActivity) < thirtyDaysAgo) continue;
      } else if (filter === 'inactive') {
        // 30일 이상 활동 없음
        if (lastActivity) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (new Date(lastActivity) >= thirtyDaysAgo) continue;
        }
      }

      usersData.push({
        id: userId,
        email: userData.email || '',
        name: userData.name || userData.email?.split('@')[0] || 'Unknown',
        isPremium: userData.isPremium || false,
        subscriptionPlan: userData.subscriptionPlan || 'free',
        emailVerified: userData.emailVerified || false,
        photoURL: userData.photoURL || null,
        createdAt: userData.createdAt instanceof Timestamp
          ? userData.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        updatedAt: userData.updatedAt instanceof Timestamp
          ? userData.updatedAt.toDate().toISOString()
          : new Date().toISOString(),
        historyCount,
        lastActivity,
      });
    }

    // 정렬
    usersData.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sort) {
        case 'email':
          aVal = a.email;
          bVal = b.email;
          break;
        case 'historyCount':
          aVal = a.historyCount;
          bVal = b.historyCount;
          break;
        case 'lastActivity':
          aVal = a.lastActivity || '';
          bVal = b.lastActivity || '';
          break;
        case 'createdAt':
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
      }

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // 페이지네이션
    const total = usersData.length;
    const paginatedUsers = usersData.slice(offset, offset + limit);

    // 5. 성공 응답
    return successResponse(
      {
        users: paginatedUsers,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        filter,
        sort,
        order,
      },
      `${total}명의 사용자를 조회했습니다.`
    );

  } catch (error) {
    return safeInternalServerErrorResponse(
      '사용자 목록 조회 중 오류가 발생했습니다.',
      error,
      'Get users error'
    );
  }
}
