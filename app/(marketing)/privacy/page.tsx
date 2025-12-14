// app/(marketing)/privacy/page.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
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
    { id: 'article-2', title: '제2조(개인정보 처리의 원칙)' },
    { id: 'article-3', title: '제3조(본 방침의 공개)' },
    { id: 'article-4', title: '제4조(본 방침의 변경)' },
    { id: 'article-5', title: '제5조(회원 가입을 위한 정보)' },
    { id: 'article-6', title: '제6조(본인 인증을 위한 정보)' },
    { id: 'article-7', title: '제7조(결제 서비스를 위한 정보)' },
    { id: 'article-8', title: '제8조(회사 서비스 제공을 위한 정보)' },
    { id: 'article-9', title: '제9조(서비스 이용 및 부정 이용 확인을 위한 정보)' },
    { id: 'article-10', title: '제10조(개인정보 수집 방법)' },
    { id: 'article-11', title: '제11조(개인정보의 이용)' },
    { id: 'article-12', title: '제12조(개인정보의 보유 및 이용기간)' },
    { id: 'article-13', title: '제13조(법령에 따른 개인정보의 보유 및 이용기간)' },
    { id: 'article-14', title: '제14조(개인정보의 파기절차)' },
    { id: 'article-15', title: '제15조(개인정보파기절차)' },
    { id: 'article-16', title: '제16조(개인정보파기방법)' },
    { id: 'article-17', title: '제17조(광고성 정보의 전송 조치)' },
    { id: 'article-18', title: '제18조(이용자의 의무)' },
    { id: 'article-19', title: '제19조(개인정보 유출 등에 대한 조치)' },
    { id: 'article-20', title: '제20조(개인정보 유출 등에 대한 조치의 예외)' },
    { id: 'article-21', title: '제21조(개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)' },
    { id: 'article-22', title: '제22조(쿠키 설치 허용 지침 방법)' },
    { id: 'article-23', title: '제23조(회사의 개인정보 보호 책임자 지정)' },
    { id: 'article-24', title: '제24조(권익침해에 대한 구제방법)' },
  ];

  // 목차 항목 (영어)
  const tableOfContentsEn = [
    { id: 'article-1', title: 'Article 1 (Purpose)' },
    { id: 'article-2', title: 'Article 2 (Principles of Personal Information Processing)' },
    { id: 'article-3', title: 'Article 3 (Disclosure of Policy)' },
    { id: 'article-4', title: 'Article 4 (Changes to Policy)' },
    { id: 'article-5', title: 'Article 5 (Information for Membership Registration)' },
    { id: 'article-6', title: 'Article 6 (Information for Identity Verification)' },
    { id: 'article-7', title: 'Article 7 (Information for Payment Services)' },
    { id: 'article-8', title: 'Article 8 (Information for Service Provision)' },
    { id: 'article-9', title: 'Article 9 (Information for Service Usage and Fraud Prevention)' },
    { id: 'article-10', title: 'Article 10 (Methods of Personal Information Collection)' },
    { id: 'article-11', title: 'Article 11 (Use of Personal Information)' },
    { id: 'article-12', title: 'Article 12 (Retention and Use Period of Personal Information)' },
    { id: 'article-13', title: 'Article 13 (Legal Retention Period of Personal Information)' },
    { id: 'article-14', title: 'Article 14 (Personal Information Destruction Procedures)' },
    { id: 'article-15', title: 'Article 15 (Personal Information Destruction Process)' },
    { id: 'article-16', title: 'Article 16 (Personal Information Destruction Methods)' },
    { id: 'article-17', title: 'Article 17 (Measures for Advertising Information Transmission)' },
    { id: 'article-18', title: 'Article 18 (User Obligations)' },
    { id: 'article-19', title: 'Article 19 (Measures for Personal Information Leakage)' },
    { id: 'article-20', title: 'Article 20 (Exceptions to Leakage Measures)' },
    { id: 'article-21', title: 'Article 21 (Automatic Collection Device Installation)' },
    { id: 'article-22', title: 'Article 22 (Cookie Settings Guide)' },
    { id: 'article-23', title: 'Article 23 (Privacy Officer Designation)' },
    { id: 'article-24', title: 'Article 24 (Remedies for Rights Infringement)' },
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
                {t('legal.privacy.tableOfContents')}
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
                {t('legal.privacy.title')}
              </h1>
              <p className="text-gray-600 mb-2">
                {t('legal.privacy.subtitle')}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {t('legal.privacy.lastUpdated')}: 2025.11.21 • {t('legal.privacy.effectiveDate')}
              </p>

              <hr className="my-8" />

              {/* 한국어 버전 */}
              {locale === 'ko' && (
                <>
                  {/* Article 1 */}
                  <section id="article-1" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제1조(목적)</h2>
                    <p>
                      OCEANCODE(이하 &apos;회사&apos;라고 함)는 회사가 제공하고자 하는 서비스(이하 &apos;회사 서비스&apos;)를 이용하는 개인(이하 &apos;이용자&apos; 또는 &apos;개인&apos;)의 정보(이하 &apos;개인정보&apos;)를 보호하기 위해, 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 &apos;정보통신망법&apos;) 등 관련 법령을 준수하고, 서비스 이용자의 개인정보 보호 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침(이하 &apos;본 방침&apos;)을 수립합니다.
                    </p>
                  </section>

                  {/* Article 2 */}
                  <section id="article-2" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제2조(개인정보 처리의 원칙)</h2>
                    <p>
                      개인정보 관련 법령 및 본 방침에 따라 회사는 이용자의 개인정보를 수집할 수 있으며 수집된 개인정보는 개인의 동의가 있는 경우에 한해 제3자에게 제공될 수 있습니다. 단, 법령의 규정 등에 의해 적법하게 강제되는 경우 회사는 수집한 이용자의 개인정보를 사전에 개인의 동의 없이 제3자에게 제공할 수도 있습니다.
                    </p>
                  </section>

                  {/* Article 3 */}
                  <section id="article-3" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제3조(본 방침의 공개)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 이용자가 언제든지 쉽게 본 방침을 확인할 수 있도록 회사 홈페이지 첫 화면 또는 첫 화면과의 연결화면을 통해 본 방침을 공개하고 있습니다.</li>
                      <li>회사는 제1항에 따라 본 방침을 공개하는 경우 글자 크기, 색상 등을 활용하여 이용자가 본 방침을 쉽게 확인할 수 있도록 합니다.</li>
                    </ol>
                  </section>

                  {/* Article 4 */}
                  <section id="article-4" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제4조(본 방침의 변경)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>본 방침은 개인정보 관련 법령, 지침, 고시 또는 정부나 회사 서비스의 정책이나 내용의 변경에 따라 개정될 수 있습니다.</li>
                      <li>회사는 제1항에 따라 본 방침을 개정하는 경우 다음 각 호 하나 이상의 방법으로 공지합니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>회사가 운영하는 인터넷 홈페이지의 첫 화면의 공지사항란 또는 별도의 창을 통하여 공지하는 방법</li>
                          <li>서면·모사전송·전자우편 또는 이와 비슷한 방법으로 이용자에게 공지하는 방법</li>
                        </ul>
                      </li>
                      <li>회사는 제2항의 공지는 본 방침 개정의 시행일로부터 최소 7일 이전에 공지합니다. 다만, 이용자 권리의 중요한 변경이 있을 경우에는 최소 30일 전에 공지합니다.</li>
                    </ol>
                  </section>

                  {/* Article 5 */}
                  <section id="article-5" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제5조(회원 가입을 위한 정보)</h2>
                    <p>회사는 이용자의 회사 서비스에 대한 회원가입을 위하여 다음과 같은 정보를 수집합니다.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>필수 수집 정보:</strong> 이메일 주소, 비밀번호, 이름 및 닉네임</li>
                    </ul>
                  </section>

                  {/* Article 6 */}
                  <section id="article-6" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제6조(본인 인증을 위한 정보)</h2>
                    <p>회사는 이용자의 본인인증을 위하여 다음과 같은 정보를 수집합니다.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>필수 수집 정보:</strong> 이메일 주소</li>
                    </ul>
                  </section>

                  {/* Article 7 */}
                  <section id="article-7" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제7조(결제 서비스를 위한 정보)</h2>
                    <p>회사는 이용자에게 회사의 결제 서비스 제공을 위하여 다음과 같은 정보를 수집합니다.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>필수 수집 정보:</strong> 카드번호, 카드비밀번호 및 유효기간</li>
                    </ul>
                  </section>

                  {/* Article 8 */}
                  <section id="article-8" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제8조(회사 서비스 제공을 위한 정보)</h2>
                    <p>회사는 이용자에게 회사의 서비스를 제공하기 위하여 다음과 같은 정보를 수집합니다.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>필수 수집 정보:</strong> 아이디 및 이메일 주소</li>
                    </ul>
                  </section>

                  {/* Article 9 */}
                  <section id="article-9" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제9조(서비스 이용 및 부정 이용 확인을 위한 정보)</h2>
                    <p>회사는 이용자의 서비스 이용에 따른 통계·분석 및 부정이용의 확인·분석을 위하여 다음과 같은 정보를 수집합니다. (부정이용이란 회원탈퇴 후 재가입, 상품구매 후 구매취소 등을 반복적으로 행하는 등 회사가 제공하는 할인쿠폰, 이벤트 혜택 등의 경제상 이익을 불·편법적으로 수취하는 행위, 이용약관 등에서 금지하고 있는 행위, 명의도용 등의 불·편법행위 등을 말합니다.)</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>필수 수집 정보:</strong> 서비스 이용기록</li>
                    </ul>
                  </section>

                  {/* Article 10 */}
                  <section id="article-10" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제10조(개인정보 수집 방법)</h2>
                    <p>회사는 다음과 같은 방법으로 이용자의 개인정보를 수집합니다.</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>이용자가 회사의 홈페이지에 자신의 개인정보를 입력하는 방식</li>
                      <li>어플리케이션 등 회사가 제공하는 홈페이지 외의 서비스를 통해 이용자가 자신의 개인정보를 입력하는 방식</li>
                      <li>이용자가 회사가 발송한 이메일을 수신받아 개인정보를 입력하는 방식</li>
                      <li>이용자가 고객센터의 상담, 게시판에서의 활동 등 회사의 서비스를 이용하는 과정에서 이용자가 입력하는 방식</li>
                    </ol>
                  </section>

                  {/* Article 11 */}
                  <section id="article-11" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제11조(개인정보의 이용)</h2>
                    <p>회사는 개인정보를 다음 각 호의 경우에 이용합니다.</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>공지사항의 전달 등 회사운영에 필요한 경우</li>
                      <li>이용문의에 대한 회신, 불만의 처리 등 이용자에 대한 서비스 개선을 위한 경우</li>
                      <li>회사의 서비스를 제공하기 위한 경우</li>
                      <li>법령 및 회사 약관을 위반하는 회원에 대한 이용 제한 조치, 부정 이용 행위를 포함하여 서비스의 원활한 운영에 지장을 주는 행위에 대한 방지 및 제재를 위한 경우</li>
                      <li>신규 서비스 개발을 위한 경우</li>
                      <li>이벤트 및 행사 안내 등 마케팅을 위한 경우</li>
                    </ol>
                  </section>

                  {/* Article 12 */}
                  <section id="article-12" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제12조(개인정보의 보유 및 이용기간)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 이용자의 개인정보에 대해 개인정보의 수집·이용 목적 달성을 위한 기간 동안 개인정보를 보유 및 이용합니다.</li>
                      <li>전항에도 불구하고 회사는 내부 방침에 의해 서비스 부정이용기록은 부정 가입 및 이용 방지를 위하여 회원 탈퇴 시점으로부터 최대 1년간 보관합니다.</li>
                    </ol>
                  </section>

                  {/* Article 13 */}
                  <section id="article-13" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제13조(법령에 따른 개인정보의 보유 및 이용기간)</h2>
                    <p>회사는 관계법령에 따라 다음과 같이 개인정보를 보유 및 이용합니다.</p>
                    
                    <h3 className="text-xl font-semibold mt-4 mb-2">전자상거래 등에서의 소비자보호에 관한 법률</h3>
                    <ul className="list-disc pl-6">
                      <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                      <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                      <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                      <li>표시·광고에 관한 기록: 6개월</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">통신비밀보호법</h3>
                    <ul className="list-disc pl-6">
                      <li>웹사이트 로그 기록 자료: 3개월</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">전자금융거래법</h3>
                    <ul className="list-disc pl-6">
                      <li>전자금융거래에 관한 기록: 5년</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">위치정보의 보호 및 이용 등에 관한 법률</h3>
                    <ul className="list-disc pl-6">
                      <li>개인위치정보에 관한 기록: 6개월</li>
                    </ul>
                  </section>

                  {/* Article 14 */}
                  <section id="article-14" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제14조(개인정보의 파기절차)</h2>
                    <p>회사는 원칙적으로 이용자의 개인정보 처리 목적의 달성, 보유·이용기간의 경과 등 개인정보가 필요하지 않을 경우에는 해당 정보를 지체 없이 파기합니다.</p>
                  </section>

                  {/* Article 15 */}
                  <section id="article-15" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제15조(개인정보파기절차)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>이용자가 회원가입 등을 위해 입력한 정보는 개인정보 처리 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장 후 파기 되어집니다.</li>
                      <li>회사는 파기 사유가 발생한 개인정보를 개인정보보호 책임자의 승인절차를 거쳐 파기합니다.</li>
                    </ol>
                  </section>

                  {/* Article 16 */}
                  <section id="article-16" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제16조(개인정보파기방법)</h2>
                    <p>회사는 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이로 출력된 개인정보는 분쇄기로 분쇄하거나 소각 등을 통하여 파기합니다.</p>
                  </section>

                  {/* Article 17 */}
                  <section id="article-17" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제17조(광고성 정보의 전송 조치)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 전자적 전송매체를 이용하여 영리목적의 광고성 정보를 전송하는 경우 이용자의 명시적인 사전동의를 받습니다.</li>
                      <li>회사는 전항에도 불구하고 수신자가 수신거부의사를 표시하거나 사전 동의를 철회한 경우에는 영리목적의 광고성 정보를 전송하지 않으며 수신거부 및 수신동의 철회에 대한 처리 결과를 알립니다.</li>
                      <li>회사는 오후 9시부터 그 다음 날 오전 8시까지의 시간에 전자적 전송매체를 이용하여 영리목적의 광고성 정보를 전송하는 경우에는 제1항에도 불구하고 그 수신자로부터 별도의 사전 동의를 받습니다.</li>
                    </ol>
                  </section>

                  {/* Article 18 */}
                  <section id="article-18" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제18조(이용자의 의무)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>이용자는 자신의 개인정보를 최신의 상태로 유지해야 하며, 이용자의 부정확한 정보 입력으로 발생하는 문제의 책임은 이용자 자신에게 있습니다.</li>
                      <li>타인의 개인정보를 도용한 회원가입의 경우 이용자 자격을 상실하거나 관련 개인정보보호 법령에 의해 처벌받을 수 있습니다.</li>
                      <li>이용자는 전자우편주소, 비밀번호 등에 대한 보안을 유지할 책임이 있으며 제3자에게 이를 양도하거나 대여할 수 없습니다.</li>
                    </ol>
                  </section>

                  {/* Article 19 */}
                  <section id="article-19" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제19조(개인정보 유출 등에 대한 조치)</h2>
                    <p>회사는 개인정보의 분실·도난·유출(이하 &apos;유출 등&apos;이라 한다) 사실을 안 때에는 지체 없이 다음 각 호의 모든 사항을 해당 이용자에게 알리고 방송통신위원회 또는 한국인터넷진흥원에 신고합니다.</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>유출 등이 된 개인정보 항목</li>
                      <li>유출 등이 발생한 시점</li>
                      <li>이용자가 취할 수 있는 조치</li>
                      <li>정보통신서비스 제공자 등의 대응 조치</li>
                      <li>이용자가 상담 등을 접수할 수 있는 부서 및 연락처</li>
                    </ol>
                  </section>

                  {/* Article 20 */}
                  <section id="article-20" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제20조(개인정보 유출 등에 대한 조치의 예외)</h2>
                    <p>회사는 전조에도 불구하고 이용자의 연락처를 알 수 없는 등 정당한 사유가 있는 경우에는 회사의 홈페이지에 30일 이상 게시하는 방법으로 전조의 통지를 갈음하는 조치를 취할 수 있습니다.</p>
                  </section>

                  {/* Article 21 */}
                  <section id="article-21" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제21조(개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 개인정보 자동 수집장치(이하 &apos;쿠키&apos;)를 사용합니다.</li>
                      <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서 이용자는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</li>
                      <li>다만, 쿠키의 저장을 거부할 경우에는 로그인이 필요한 회사의 일부 서비스는 이용에 어려움이 있을 수 있습니다.</li>
                    </ol>
                  </section>

                  {/* Article 22 */}
                  <section id="article-22" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제22조(쿠키 설치 허용 지침 방법)</h2>
                    <p>웹브라우저 옵션 설정을 통해 쿠키 허용, 쿠키 차단 등의 설정을 할 수 있습니다.</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Edge:</strong> 웹브라우저 우측 상단의 설정 메뉴 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제</li>
                      <li><strong>Chrome:</strong> 웹브라우저 우측 상단의 설정 메뉴 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
                      <li><strong>Whale:</strong> 웹브라우저 우측 상단의 설정 메뉴 &gt; 개인정보 보호 &gt; 쿠키 및 기타 사이트 데이터</li>
                    </ul>
                  </section>

                  {/* Article 23 */}
                  <section id="article-23" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제23조(회사의 개인정보 보호 책임자 지정)</h2>
                    <p>회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보 보호 책임자를 지정하고 있습니다.</p>
                    
                    <div className="bg-blue-50 p-6 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold mb-3">{t('legal.privacy.contact.title')}</h3>
                      <ul className="space-y-2">
                        <li>{t('legal.privacy.contact.name')}</li>
                        <li>{t('legal.privacy.contact.position')}</li>
                        <li>{t('legal.privacy.contact.phone')}</li>
                        <li>{t('legal.privacy.contact.email')}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Article 24 */}
                  <section id="article-24" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제24조(권익침해에 대한 구제방법)</h2>
                    <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
                    
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li><strong>개인정보분쟁조정위원회:</strong> (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                      <li><strong>개인정보침해신고센터:</strong> (국번없이) 118 (privacy.kisa.or.kr)</li>
                      <li><strong>대검찰청:</strong> (국번없이) 1301 (www.spo.go.kr)</li>
                      <li><strong>경찰청:</strong> (국번없이) 182 (ecrm.cyber.go.kr)</li>
                    </ul>

                    <p className="mt-4">
                      개인정보 보호법 제35조(개인정보의 열람), 제36조(개인정보의 정정·삭제), 제37조(개인정보의 처리정지 등)의 규정에 의한 요구에 대하여 공공기관의 장이 행한 처리 또는 부작위로 인하여 권리 또는 이익의 침해를 받은 자는 행정심판법이 정하는 바에 따라 행정심판을 청구할 수 있습니다.
                    </p>

                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>중앙행정심판위원회:</strong> (국번없이) 110 (www.simpan.go.kr)</li>
                    </ul>
                  </section>

                  {/* Addendum */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">부칙</h2>
                    <p>본 방침은 2025년 11월 21일부터 시행됩니다.</p>
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
                      OCEANCODE (hereinafter referred to as &quot;the Company&quot;) establishes this Privacy Policy (hereinafter referred to as &quot;this Policy&quot;) to protect the personal information of individuals (hereinafter referred to as &quot;Users&quot; or &quot;Individuals&quot;) who use the services provided by the Company (hereinafter referred to as &quot;Company Services&quot;), comply with relevant laws such as the Personal Information Protection Act and the Act on Promotion of Information and Communications Network Utilization and Information Protection, etc., and promptly and smoothly handle complaints related to users&apos; personal information protection.
                    </p>
                  </section>

                  {/* Article 2 */}
                  <section id="article-2" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 2 (Principles of Personal Information Processing)</h2>
                    <p>
                      In accordance with personal information-related laws and this Policy, the Company may collect users&apos; personal information, and the collected personal information may be provided to third parties only with the consent of the individual. However, the Company may provide users&apos; collected personal information to third parties without prior consent when legally compelled by laws and regulations.
                    </p>
                  </section>

                  {/* Article 3 */}
                  <section id="article-3" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 3 (Disclosure of Policy)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company discloses this Policy through the homepage&apos;s main page or a linked page so that users can easily check this Policy at any time.</li>
                      <li>When disclosing this Policy in accordance with Paragraph 1, the Company uses font size, color, etc. to enable users to easily check this Policy.</li>
                    </ol>
                  </section>

                  {/* Article 4 */}
                  <section id="article-4" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 4 (Changes to Policy)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>This Policy may be revised in accordance with changes to personal information-related laws, guidelines, notices, or government or Company service policies or content.</li>
                      <li>When revising this Policy pursuant to Paragraph 1, the Company shall notify by one or more of the following methods:
                        <ul className="list-disc pl-6 mt-2">
                          <li>Notification through the notice section of the Company&apos;s website main page or a separate window</li>
                          <li>Notification to users by mail, facsimile, email, or similar methods</li>
                        </ul>
                      </li>
                      <li>The notification in Paragraph 2 shall be made at least 7 days prior to the effective date of the Policy revision. However, in case of significant changes to user rights, notification shall be made at least 30 days in advance.</li>
                    </ol>
                  </section>

                  {/* Article 5 */}
                  <section id="article-5" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 5 (Information for Membership Registration)</h2>
                    <p>The Company collects the following information for users&apos; membership registration for Company services.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>Required Information:</strong> Email address, password, name and nickname</li>
                    </ul>
                  </section>

                  {/* Article 6 */}
                  <section id="article-6" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 6 (Information for Identity Verification)</h2>
                    <p>The Company collects the following information for user identity verification.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>Required Information:</strong> Email address</li>
                    </ul>
                  </section>

                  {/* Article 7 */}
                  <section id="article-7" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 7 (Information for Payment Services)</h2>
                    <p>The Company collects the following information to provide payment services to users.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>Required Information:</strong> Card number, card password, and expiration date</li>
                    </ul>
                  </section>

                  {/* Article 8 */}
                  <section id="article-8" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 8 (Information for Service Provision)</h2>
                    <p>The Company collects the following information to provide its services to users.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>Required Information:</strong> User ID and email address</li>
                    </ul>
                  </section>

                  {/* Article 9 */}
                  <section id="article-9" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 9 (Information for Service Usage and Fraud Prevention)</h2>
                    <p>The Company collects the following information for statistics and analysis of service usage and identification and analysis of fraudulent use.</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>Required Information:</strong> Service usage records</li>
                    </ul>
                  </section>

                  {/* Article 10 */}
                  <section id="article-10" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 10 (Methods of Personal Information Collection)</h2>
                    <p>The Company collects users&apos; personal information through the following methods:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Users entering their personal information on the Company&apos;s website</li>
                      <li>Users entering their personal information through services other than the homepage provided by the Company, such as applications</li>
                      <li>Users entering personal information upon receiving emails sent by the Company</li>
                      <li>Users entering information while using Company services such as customer service consultations and bulletin board activities</li>
                    </ol>
                  </section>

                  {/* Article 11 */}
                  <section id="article-11" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 11 (Use of Personal Information)</h2>
                    <p>The Company uses personal information in the following cases:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>For Company operations such as delivering notices</li>
                      <li>For service improvement, such as responding to inquiries and handling complaints</li>
                      <li>For providing Company services</li>
                      <li>For restricting use by members who violate laws and Company terms, and preventing and sanctioning acts that interfere with smooth service operations, including fraudulent use</li>
                      <li>For developing new services</li>
                      <li>For marketing purposes such as event and promotional notifications</li>
                    </ol>
                  </section>

                  {/* Article 12 */}
                  <section id="article-12" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 12 (Retention and Use Period of Personal Information)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company retains and uses users&apos; personal information for the period necessary to achieve the purpose of collection and use of personal information.</li>
                      <li>Notwithstanding the preceding paragraph, the Company retains fraudulent service use records for up to 1 year from the time of membership withdrawal to prevent fraudulent registration and use in accordance with internal policies.</li>
                    </ol>
                  </section>

                  {/* Article 13 */}
                  <section id="article-13" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 13 (Legal Retention Period of Personal Information)</h2>
                    <p>The Company retains and uses personal information in accordance with relevant laws as follows:</p>
                    
                    <h3 className="text-xl font-semibold mt-4 mb-2">Consumer Protection in Electronic Commerce Act</h3>
                    <ul className="list-disc pl-6">
                      <li>Records of contracts or withdrawal of offers: 5 years</li>
                      <li>Records of payment and supply of goods: 5 years</li>
                      <li>Records of consumer complaints or dispute resolution: 3 years</li>
                      <li>Records of labeling and advertising: 6 months</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">Protection of Communications Secrets Act</h3>
                    <ul className="list-disc pl-6">
                      <li>Website log records: 3 months</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">Electronic Financial Transactions Act</h3>
                    <ul className="list-disc pl-6">
                      <li>Records of electronic financial transactions: 5 years</li>
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">Location Information Protection and Use Act</h3>
                    <ul className="list-disc pl-6">
                      <li>Records of personal location information: 6 months</li>
                    </ul>
                  </section>

                  {/* Article 14 */}
                  <section id="article-14" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 14 (Personal Information Destruction Procedures)</h2>
                    <p>In principle, the Company destroys personal information without delay when it is no longer needed, such as when the purpose of processing personal information is achieved or the retention and use period has expired.</p>
                  </section>

                  {/* Article 15 */}
                  <section id="article-15" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 15 (Personal Information Destruction Process)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Information entered by users for membership registration, etc. is transferred to a separate database (or separate file cabinet in case of paper) after achieving the purpose of personal information processing and stored for a certain period in accordance with internal policies and information protection reasons under relevant laws (refer to retention and use period) before being destroyed.</li>
                      <li>The Company destroys personal information for which destruction reasons have occurred through the approval process of the privacy officer.</li>
                    </ol>
                  </section>

                  {/* Article 16 */}
                  <section id="article-16" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 16 (Personal Information Destruction Methods)</h2>
                    <p>The Company deletes personal information stored in electronic file format using technical methods that make records irreproducible, and destroys personal information printed on paper by shredding or incineration.</p>
                  </section>

                  {/* Article 17 */}
                  <section id="article-17" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 17 (Measures for Advertising Information Transmission)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>When transmitting commercial advertising information using electronic transmission media, the Company obtains users&apos; explicit prior consent.</li>
                      <li>Notwithstanding the preceding paragraph, the Company does not transmit commercial advertising information when recipients express refusal or withdraw prior consent, and notifies the processing results of refusal and consent withdrawal.</li>
                      <li>When transmitting commercial advertising information using electronic transmission media between 9 PM and 8 AM the next day, the Company obtains separate prior consent from recipients notwithstanding Paragraph 1.</li>
                    </ol>
                  </section>

                  {/* Article 18 */}
                  <section id="article-18" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 18 (User Obligations)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Users must maintain their personal information in an up-to-date state, and users are responsible for problems arising from inaccurate information input.</li>
                      <li>In case of membership registration using another person&apos;s personal information, users may lose their qualifications or be punished in accordance with relevant personal information protection laws.</li>
                      <li>Users are responsible for maintaining security of their email addresses, passwords, etc., and cannot transfer or lend them to third parties.</li>
                    </ol>
                  </section>

                  {/* Article 19 */}
                  <section id="article-19" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 19 (Measures for Personal Information Leakage)</h2>
                    <p>When the Company becomes aware of loss, theft, or leakage of personal information, it shall notify the relevant user without delay of all of the following matters and report to the Korea Communications Commission or Korea Internet & Security Agency:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Items of personal information that were leaked</li>
                      <li>Time when leakage occurred</li>
                      <li>Measures users can take</li>
                      <li>Response measures by the information and communications service provider</li>
                      <li>Department and contact information where users can receive consultation</li>
                    </ol>
                  </section>

                  {/* Article 20 */}
                  <section id="article-20" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 20 (Exceptions to Leakage Measures)</h2>
                    <p>Notwithstanding the preceding article, when there are legitimate reasons such as inability to know users&apos; contact information, the Company may take measures to substitute the notification in the preceding article by posting it on the Company&apos;s website for 30 days or more.</p>
                  </section>

                  {/* Article 21 */}
                  <section id="article-21" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 21 (Automatic Collection Device Installation)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company uses automatic personal information collection devices (cookies) that store and retrieve usage information to provide personalized services to users.</li>
                      <li>Users have the option to accept cookies. Therefore, users can allow all cookies, check each time a cookie is stored, or reject all cookie storage by setting options in their web browser.</li>
                      <li>However, if cookie storage is rejected, some Company services requiring login may be difficult to use.</li>
                    </ol>
                  </section>

                  {/* Article 22 */}
                  <section id="article-22" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 22 (Cookie Settings Guide)</h2>
                    <p>Cookie acceptance and blocking can be set through web browser option settings.</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Edge:</strong> Settings menu in top right of web browser &gt; Cookies and site permissions &gt; Manage and delete cookies and site data</li>
                      <li><strong>Chrome:</strong> Settings menu in top right of web browser &gt; Privacy and security &gt; Cookies and other site data</li>
                      <li><strong>Whale:</strong> Settings menu in top right of web browser &gt; Privacy protection &gt; Cookies and other site data</li>
                    </ul>
                  </section>

                  {/* Article 23 */}
                  <section id="article-23" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 23 (Privacy Officer Designation)</h2>
                    <p>The Company designates relevant departments and privacy officers as follows to protect users&apos; personal information and handle complaints related to personal information.</p>
                    
                    <div className="bg-blue-50 p-6 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold mb-3">{t('legal.privacy.contact.title')}</h3>
                      <ul className="space-y-2">
                        <li>{t('legal.privacy.contact.name')}</li>
                        <li>{t('legal.privacy.contact.position')}</li>
                        <li>{t('legal.privacy.contact.phone')}</li>
                        <li>{t('legal.privacy.contact.email')}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Article 24 */}
                  <section id="article-24" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 24 (Remedies for Rights Infringement)</h2>
                    <p>Data subjects can apply for dispute resolution or consultation with the Personal Information Dispute Mediation Committee, Korea Internet & Security Agency Personal Information Infringement Report Center, etc. to receive remedies for personal information infringement.</p>
                    
                    <ul className="list-disc pl-6 space-y-2 mt-4">
                      <li><strong>Personal Information Dispute Mediation Committee:</strong> 1833-6972 (www.kopico.go.kr)</li>
                      <li><strong>Personal Information Infringement Report Center:</strong> 118 (privacy.kisa.or.kr)</li>
                      <li><strong>Supreme Prosecutors&apos; Office:</strong> 1301 (www.spo.go.kr)</li>
                      <li><strong>Korean National Police Agency:</strong> 182 (ecrm.cyber.go.kr)</li>
                    </ul>

                    <p className="mt-4">
                      Those who have suffered infringement of rights or interests due to actions or inactions by heads of public institutions in response to requests under Articles 35 (Access to Personal Information), 36 (Correction and Deletion of Personal Information), and 37 (Suspension of Personal Information Processing) of the Personal Information Protection Act may file for administrative appeals in accordance with the Administrative Appeals Act.
                    </p>

                    <ul className="list-disc pl-6 mt-2">
                      <li><strong>Central Administrative Appeals Commission:</strong> 110 (www.simpan.go.kr)</li>
                    </ul>
                  </section>

                  {/* Addendum */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Addendum</h2>
                    <p>This Policy shall be effective from November 21, 2025.</p>
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
        aria-label={t('legal.privacy.backToTop')}
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}