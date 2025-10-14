// lib/api-client.ts
import { getIdToken } from './auth';

/**
 * 인증된 API 요청
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getIdToken();

  if (!token) {
    throw new Error('User is not authenticated');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * 사용 예시
 */
export async function getUserData() {
  const response = await authenticatedFetch('/api/user/profile');
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }

  return await response.json();
}