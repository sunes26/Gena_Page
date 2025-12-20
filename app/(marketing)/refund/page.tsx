// app/(marketing)/refund/page.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RefundPolicyPage() {
  const { t, locale } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('');

  // 스크롤 시 현재 섹션 추적
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
          current = section.getAttribute('id') || '';
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 목차 항목 (한국어)
  const tableOfContentsKo = [
    { id: 'article-1', title: '제1조(목적)' },
    { id: 'article-2', title: '제2조(환불 정책)' },
    { id: 'article-3', title: '제3조(환불 가능 기간)' },
    { id: 'article-4', title: '제4조(환불 절차)' },
    { id: 'article-5', title: '제5조(환불 처리 기간)' },
    { id: 'article-6', title: '제6조(소비자 권리)' },
    { id: 'article-7', title: '제7조(문의)' },
  ];

  // 목차 항목 (영어)
  const tableOfContentsEn = [
    { id: 'article-1', title: 'Article 1 (Purpose)' },
    { id: 'article-2', title: 'Article 2 (Refund Policy)' },
    { id: 'article-3', title: 'Article 3 (Refund Period)' },
    { id: 'article-4', title: 'Article 4 (Refund Procedure)' },
    { id: 'article-5', title: 'Article 5 (Refund Processing Time)' },
    { id: 'article-6', title: 'Article 6 (Consumer Rights)' },
    { id: 'article-7', title: 'Article 7 (Contact)' },
  ];

  const tableOfContents = locale === 'ko' ? tableOfContentsKo : tableOfContentsEn;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Gena
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4">
                {t('legal.refund.tableOfContents')}
              </h2>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm py-2 px-3 rounded transition ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8 prose prose-lg max-w-none">
              {/* Title */}
              <h1 className="text-4xl font-bold mb-4">
                {t('legal.refund.title')}
              </h1>
              <p className="text-gray-600 mb-2">
                {t('legal.refund.subtitle')}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {t('legal.refund.lastUpdated')}: 2025.11.21 • {t('legal.refund.effectiveDate')}
              </p>

              <hr className="my-8" />

              {/* 한국어 버전 */}
              {locale === 'ko' && (
                <>
                  {/* Article 1 */}
                  <section id="article-1" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제1조(목적)</h2>
                    <p>
                      본 환불 정책은 OCEANCODE(이하 &apos;회사&apos;)가 제공하는 Gena 서비스(이하 &apos;서비스&apos;)의 유료 서비스 이용과 관련하여 회원의 환불 요청 시 적용되는 정책을 규정함을 목적으로 합니다.
                    </p>
                  </section>

                  {/* Article 2 */}
                  <section id="article-2" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제2조(환불 정책)</h2>
                    <p>
                      본 서비스의 결제는 Paddle을 통해 처리되며, 환불은 Paddle의 환불 정책에 따라 케이스별로 처리됩니다.
                    </p>
                    <p className="mt-4">
                      Paddle은 사기, 환불 남용 또는 기타 조작 행위의 증거가 발견되는 경우 환불 요청을 거부할 수 있습니다.
                    </p>
                    <p className="mt-4">
                      이는 제품이 설명과 다르거나, 결함이 있거나, 목적에 적합하지 않은 경우 소비자로서의 귀하의 권리에 영향을 미치지 않습니다.
                    </p>
                  </section>

                  {/* Article 3 */}
                  <section id="article-3" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제3조(환불 가능 기간)</h2>
                    <p>
                      구독 서비스의 경우, 결제일로부터 14일 이내에 환불을 요청할 수 있습니다.
                    </p>
                    <p className="mt-4">
                      환불 요청은 케이스별로 검토되며, Paddle의 재량에 따라 처리됩니다.
                    </p>
                  </section>

                  {/* Article 4 */}
                  <section id="article-4" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제4조(환불 절차)</h2>
                    <p>환불을 원하시는 경우 다음 절차를 따라주시기 바랍니다.</p>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
                      <li>회원은 이메일(oceancode0321@gmail.com)을 통해 환불 요청을 할 수 있습니다.</li>
                      <li>환불 요청 시 다음 정보를 제공해야 합니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>회원 계정 정보(이메일)</li>
                          <li>결제 내역 및 결제 날짜</li>
                          <li>환불 사유</li>
                        </ul>
                      </li>
                      <li>회사는 환불 요청을 검토한 후 환불 가능 여부를 이메일로 통보합니다.</li>
                      <li>환불이 승인되면 결제 수단에 따라 환불이 처리됩니다.</li>
                    </ol>
                  </section>

                  {/* Article 5 */}
                  <section id="article-5" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제5조(환불 처리 기간)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>환불 승인 후 처리 기간은 결제 수단에 따라 다를 수 있습니다.</li>
                      <li>신용카드 결제의 경우 환불 승인 후 3~5 영업일 이내에 처리됩니다.</li>
                      <li>기타 결제 수단의 경우 해당 결제사의 정책에 따라 처리됩니다.</li>
                      <li>환불 처리가 지연되는 경우, 그 사유를 통지합니다.</li>
                    </ol>
                  </section>

                  {/* Article 6 */}
                  <section id="article-6" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제6조(소비자 권리)</h2>
                    <p>
                      본 환불 정책은 제품이 설명과 다르거나, 결함이 있거나, 목적에 적합하지 않은 경우 소비자로서의 귀하의 권리에 영향을 미치지 않습니다.
                    </p>
                    <p className="mt-4">
                      소비자 권리 보호와 관련된 문제는 관련 법령에 따라 처리됩니다.
                    </p>
                  </section>

                  {/* Article 7 */}
                  <section id="article-7" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제7조(문의)</h2>
                    <p>환불 관련 문의사항이 있으시면 아래 연락처로 문의해 주시기 바랍니다.</p>

                    <div className="bg-blue-50 p-6 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold mb-3">고객센터</h3>
                      <ul className="space-y-2">
                        <li>이메일: oceancode0321@gmail.com</li>
                        <li>운영 시간: 평일 09:00 - 18:00 (주말 및 공휴일 제외)</li>
                      </ul>
                    </div>
                  </section>

                  {/* Addendum */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">부칙</h2>
                    <p>본 정책은 2024년 12월 19일부터 시행됩니다.</p>
                  </section>
                </>
              )}

              {/* 영어 버전 */}
              {locale === 'en' && (
                <>
                  {/* Article 1 */}
                  <section id="article-1" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 1 (Purpose)</h2>
                    <p>
                      This Refund Policy establishes the policy applied to refund requests from members regarding the use of paid services of the Gena service (hereinafter referred to as &quot;Service&quot;) provided by OCEANCODE (hereinafter referred to as &quot;the Company&quot;).
                    </p>
                  </section>

                  {/* Article 2 */}
                  <section id="article-2" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 2 (Refund Policy)</h2>
                    <p>
                      Payments for this Service are processed through Paddle, and refunds are handled on a case-by-case basis in accordance with Paddle&apos;s refund policy.
                    </p>
                    <p className="mt-4">
                      Paddle may decline refund requests if there is evidence of fraud, refund abuse, or other manipulative behavior.
                    </p>
                    <p className="mt-4">
                      This does not affect your rights as a consumer if the product is not as described, is defective, or is not fit for purpose.
                    </p>
                  </section>

                  {/* Article 3 */}
                  <section id="article-3" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 3 (Refund Period)</h2>
                    <p>
                      For subscription services, you may request a refund within 14 days from the payment date.
                    </p>
                    <p className="mt-4">
                      Refund requests are reviewed on a case-by-case basis and are processed at Paddle&apos;s discretion.
                    </p>
                  </section>

                  {/* Article 4 */}
                  <section id="article-4" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 4 (Refund Procedure)</h2>
                    <p>If you wish to receive a refund, please follow these procedures:</p>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
                      <li>Members can request a refund via email (oceancode0321@gmail.com).</li>
                      <li>When requesting a refund, the following information must be provided:
                        <ul className="list-disc pl-6 mt-2">
                          <li>Member account information (email)</li>
                          <li>Payment details and payment date</li>
                          <li>Reason for refund</li>
                        </ul>
                      </li>
                      <li>The Company reviews the refund request and notifies the member of refund eligibility via email.</li>
                      <li>Once the refund is approved, it is processed according to the payment method.</li>
                    </ol>
                  </section>

                  {/* Article 5 */}
                  <section id="article-5" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 5 (Refund Processing Time)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The processing time after refund approval may vary depending on the payment method.</li>
                      <li>For credit card payments, processing occurs within 3-5 business days after refund approval.</li>
                      <li>For other payment methods, processing follows the respective payment provider&apos;s policy.</li>
                      <li>If refund processing is delayed, the Company notifies the member of the reason.</li>
                    </ol>
                  </section>

                  {/* Article 6 */}
                  <section id="article-6" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 6 (Consumer Rights)</h2>
                    <p>
                      This policy does not affect your statutory consumer rights. If the product is not as described, is defective, or is not fit for purpose, you may be entitled to a refund regardless of the refund period.
                    </p>
                    <p className="mt-4">
                      For more information about your consumer rights, please refer to the consumer protection laws in your jurisdiction.
                    </p>
                  </section>

                  {/* Article 7 */}
                  <section id="article-7" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 7 (Contact)</h2>
                    <p>If you have any refund-related inquiries, please contact us at the following address:</p>

                    <div className="bg-blue-50 p-6 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold mb-3">Customer Service</h3>
                      <ul className="space-y-2">
                        <li>Email: oceancode0321@gmail.com</li>
                        <li>Operating Hours: Weekdays 09:00 - 18:00 (excluding weekends and holidays)</li>
                      </ul>
                    </div>
                  </section>

                  {/* Addendum */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Addendum</h2>
                    <p>This Policy shall be effective from December 19, 2024.</p>
                  </section>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
        aria-label={t('legal.refund.backToTop')}
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
