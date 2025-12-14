// components/seo/JsonLd.tsx
/**
 * JSON-LD 구조화된 데이터 컴포넌트
 * Schema.org 형식의 데이터를 페이지 <head>에 주입
 * Google, Bing 등 검색 엔진이 페이지 내용을 더 잘 이해하도록 도움
 * 
 * @example
 * <JsonLd data={getOrganizationSchema()} />
 */

interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function JsonLd({ data }: JsonLdProps) {
  // 배열인 경우 여러 스키마를 포함
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0), // 압축된 JSON (프로덕션)
          }}
        />
      ))}
    </>
  );
}

/**
 * 개발 환경용 JsonLd (포맷팅된 JSON)
 */
export function JsonLdDev({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2), // 포맷팅된 JSON (디버깅용)
          }}
        />
      ))}
    </>
  );
}

/**
 * 사용 예시:
 * 
 * // app/(marketing)/page.tsx
 * import JsonLd from '@/components/seo/JsonLd';
 * import { getOrganizationSchema, getWebApplicationSchema } from '@/lib/metadata';
 * 
 * export default function HomePage() {
 *   return (
 *     <>
 *       <JsonLd data={[
 *         getOrganizationSchema(),
 *         getWebApplicationSchema(),
 *       ]} />
 *       
 *       <main>
 *         <!-- 페이지 콘텐츠 -->
 *       </main>
 *     </>
 *   );
 * }
 */