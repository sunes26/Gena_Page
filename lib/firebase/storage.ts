// lib/firebase/storage.ts
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { getStorageInstance } from './client';

/**
 * 파일 업로드 옵션
 */
interface UploadOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (downloadURL: string) => void;
}

/**
 * 파일 크기 검증 (기본: 2MB)
 */
export function validateFileSize(file: File, maxSizeMB: number = 2): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 파일 타입 검증 (이미지만 허용)
 */
export function validateImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
}

/**
 * 프로필 사진 업로드
 * 
 * @param file - 업로드할 파일
 * @param userId - 사용자 ID
 * @param options - 업로드 옵션 (progress, error, complete 콜백)
 * @returns Promise<string> - 업로드된 파일의 다운로드 URL
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string,
  options: UploadOptions = {}
): Promise<string> {
  // 파일 검증
  if (!validateFileSize(file, 2)) {
    throw new Error('파일 크기는 2MB 이하여야 합니다.');
  }

  if (!validateImageType(file)) {
    throw new Error('이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF, WebP)');
  }

  const storage = getStorageInstance();
  
  // 파일명 생성 (타임스탬프 포함)
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop();
  const fileName = `profile_${timestamp}.${fileExtension}`;
  
  // Storage 경로: profiles/{userId}/{fileName}
  const storageRef = ref(storage, `profiles/${userId}/${fileName}`);

  // 업로드 태스크 생성
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // 진행률 계산
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        
        if (options.onProgress) {
          options.onProgress(Math.round(progress));
        }
      },
      (error) => {
        // 에러 처리
        console.error('Upload error:', error);
        
        if (options.onError) {
          options.onError(error as Error);
        }
        
        reject(error);
      },
      async () => {
        // 업로드 완료
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          if (options.onComplete) {
            options.onComplete(downloadURL);
          }
          
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * 프로필 사진 삭제
 * 
 * @param photoURL - 삭제할 사진의 URL
 */
export async function deleteProfilePhoto(photoURL: string): Promise<void> {
  try {
    const storage = getStorageInstance();
    
    // URL에서 경로 추출
    const url = new URL(photoURL);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid photo URL');
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const fileRef = ref(storage, filePath);
    
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Failed to delete profile photo:', error);
    throw new Error('프로필 사진 삭제에 실패했습니다.');
  }
}

/**
 * 이미지 URL을 Data URL로 변환 (미리보기용)
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}