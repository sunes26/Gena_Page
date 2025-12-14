// app/(marketing)/terms/page.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
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
    { id: 'article-2', title: '제2조(정의)' },
    { id: 'article-3', title: '제3조(약관의 게시 및 개정)' },
    { id: 'article-4', title: '제4조(약관의 해석)' },
    { id: 'article-5', title: '제5조(이용 계약의 성립)' },
    { id: 'article-6', title: '제6조(회원 가입)' },
    { id: 'article-7', title: '제7조(회원 정보의 변경)' },
    { id: 'article-8', title: '제8조(개인정보 보호)' },
    { id: 'article-9', title: '제9조(회사의 의무)' },
    { id: 'article-10', title: '제10조(회원의 의무)' },
    { id: 'article-11', title: '제11조(서비스의 제공 및 변경)' },
    { id: 'article-12', title: '제12조(서비스의 중단)' },
    { id: 'article-13', title: '제13조(회원 탈퇴 및 자격 상실)' },
    { id: 'article-14', title: '제14조(손해배상)' },
    { id: 'article-15', title: '제15조(면책조항)' },
    { id: 'article-16', title: '제16조(분쟁 해결)' },
  ];

  // 목차 항목 (영어)
  const tableOfContentsEn = [
    { id: 'article-1', title: 'Article 1 (Purpose)' },
    { id: 'article-2', title: 'Article 2 (Definitions)' },
    { id: 'article-3', title: 'Article 3 (Publication and Revision of Terms)' },
    { id: 'article-4', title: 'Article 4 (Interpretation of Terms)' },
    { id: 'article-5', title: 'Article 5 (Formation of Use Agreement)' },
    { id: 'article-6', title: 'Article 6 (Member Registration)' },
    { id: 'article-7', title: 'Article 7 (Changes to Member Information)' },
    { id: 'article-8', title: 'Article 8 (Privacy Protection)' },
    { id: 'article-9', title: 'Article 9 (Company Obligations)' },
    { id: 'article-10', title: 'Article 10 (Member Obligations)' },
    { id: 'article-11', title: 'Article 11 (Service Provision and Changes)' },
    { id: 'article-12', title: 'Article 12 (Service Suspension)' },
    { id: 'article-13', title: 'Article 13 (Withdrawal and Disqualification)' },
    { id: 'article-14', title: 'Article 14 (Damages)' },
    { id: 'article-15', title: 'Article 15 (Disclaimer)' },
    { id: 'article-16', title: 'Article 16 (Dispute Resolution)' },
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
                {t('legal.terms.tableOfContents')}
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
                {t('legal.terms.title')}
              </h1>
              <p className="text-gray-600 mb-2">
                {t('legal.terms.subtitle')}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {t('legal.terms.lastUpdated')}: 2025.11.21 • {t('legal.terms.effectiveDate')}
              </p>

              <hr className="my-8" />

              {/* 한국어 버전 */}
              {locale === 'ko' && (
                <>
                  {/* Article 1 */}
                  <section id="article-1" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제1조(목적)</h2>
                    <p>
                      본 약관은 OCEANCODE(이하 &quot;회사&quot;라 합니다)가 제공하는 Gena 서비스(이하 &quot;서비스&quot;라 합니다)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                    </p>
                  </section>

                  {/* Article 2 */}
                  <section id="article-2" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제2조(정의)</h2>
                    <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
                      <li><strong>&quot;서비스&quot;</strong>란 회사가 제공하는 AI 기반 웹페이지 요약 서비스를 의미합니다.</li>
                      <li><strong>&quot;회원&quot;</strong>이란 본 약관에 동의하고 회사와 이용계약을 체결한 자를 의미합니다.</li>
                      <li><strong>&quot;아이디(ID)&quot;</strong>란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인하는 문자 또는 숫자의 조합을 의미합니다.</li>
                      <li><strong>&quot;비밀번호&quot;</strong>란 회원이 부여받은 아이디와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 의미합니다.</li>
                      <li><strong>&quot;유료서비스&quot;</strong>란 회사가 유료로 제공하는 각종 서비스를 의미합니다.</li>
                    </ol>
                  </section>

                  {/* Article 3 */}
                  <section id="article-3" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제3조(약관의 게시 및 개정)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                      <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
                      <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기 화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 회원에게 불리한 약관의 개정의 경우에는 30일 이전부터 공지합니다.</li>
                      <li>회원은 개정된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 개정된 약관의 효력 발생일 이후에도 서비스를 계속 이용할 경우 약관의 변경 사항에 동의한 것으로 간주됩니다.</li>
                    </ol>
                  </section>

                  {/* Article 4 */}
                  <section id="article-4" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제4조(약관의 해석)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 본 약관 외에 개별 서비스에 대해서는 별도의 이용약관 및 정책을 둘 수 있습니다.</li>
                      <li>본 약관에 명시되지 않은 사항은 관련 법령의 규정과 일반적인 상관례에 따릅니다.</li>
                    </ol>
                  </section>

                  {/* Article 5 */}
                  <section id="article-5" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제5조(이용 계약의 성립)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>이용계약은 회원이 되고자 하는 자(이하 &quot;가입신청자&quot;라 합니다)가 본 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고, 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
                      <li>회사는 가입신청자의 신청에 대하여 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                          <li>타인의 명의를 이용한 경우</li>
                          <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                          <li>14세 미만의 아동이 법정대리인의 동의를 얻지 않은 경우</li>
                          <li>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
                        </ul>
                      </li>
                    </ol>
                  </section>

                  {/* Article 6 */}
                  <section id="article-6" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제6조(회원 가입)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회원가입은 가입신청자가 본 약관 및 개인정보처리방침의 내용에 대하여 동의한 후, 회사가 정한 가입 양식에 따라 회원정보를 기입하고 &quot;가입하기&quot; 또는 &quot;확인&quot; 등의 버튼을 누르는 방법으로 신청합니다.</li>
                      <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                          <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                        </ul>
                      </li>
                      <li>회원가입계약의 성립시기는 회사의 승낙이 회원에게 도달한 시점으로 합니다.</li>
                    </ol>
                  </section>

                  {/* Article 7 */}
                  <section id="article-7" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제7조(회원 정보의 변경)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회원은 개인정보관리화면을 통하여 언제든지 자신의 개인정보를 열람하고 수정할 수 있습니다.</li>
                      <li>회원은 회원가입신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 회사에 대하여 그 변경사항을 알려야 합니다.</li>
                      <li>제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.</li>
                    </ol>
                  </section>

                  {/* Article 8 */}
                  <section id="article-8" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제8조(개인정보 보호)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.</li>
                      <li>회원의 개인정보 보호에 관해서는 관련 법령 및 회사가 정하는 &quot;개인정보처리방침&quot;에 정한 바에 따릅니다.</li>
                      <li>회사는 회원의 귀책사유로 인하여 노출된 정보에 대해서 책임을 지지 않습니다.</li>
                    </ol>
                  </section>

                  {/* Article 9 */}
                  <section id="article-9" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제9조(회사의 의무)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.</li>
                      <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보(신용정보 포함)보호를 위해 보안시스템을 갖추어야 하며 개인정보처리방침을 공시하고 준수합니다.</li>
                      <li>회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다. 회원이 제기한 의견이나 불만사항에 대해서는 게시판을 활용하거나 전자우편 등을 통하여 회원에게 처리과정 및 결과를 전달합니다.</li>
                    </ol>
                  </section>

                  {/* Article 10 */}
                  <section id="article-10" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제10조(회원의 의무)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회원은 다음 행위를 하여서는 안 됩니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>신청 또는 변경 시 허위 내용의 등록</li>
                          <li>타인의 정보 도용</li>
                          <li>회사가 게시한 정보의 변경</li>
                          <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                          <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                          <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                          <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                          <li>서비스를 영리 목적으로 이용하는 행위</li>
                          <li>기타 불법적이거나 부당한 행위</li>
                        </ul>
                      </li>
                      <li>회원은 관계법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
                    </ol>
                  </section>

                  {/* Article 11 */}
                  <section id="article-11" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제11조(서비스의 제공 및 변경)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 다음과 같은 서비스를 제공합니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>AI 기반 웹페이지 요약 서비스</li>
                          <li>요약 기록 관리 서비스</li>
                          <li>Chrome 확장 프로그램</li>
                          <li>웹 대시보드 서비스</li>
                          <li>기타 회사가 추가 개발하거나 다른 회사와의 제휴 계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                        </ul>
                      </li>
                      <li>회사는 서비스의 내용을 변경할 경우에는 변경사유, 변경될 서비스의 내용 및 제공일자 등을 그 변경 전 7일 이상 해당 서비스 화면에 게시하여야 합니다.</li>
                      <li>회사는 무료로 제공되는 서비스의 일부 또는 전부를 회사의 정책 및 운영의 필요상 수정, 중단, 변경할 수 있으며, 이에 대하여 관련법에 특별한 규정이 없는 한 회원에게 별도의 보상을 하지 않습니다.</li>
                    </ol>
                  </section>

                  {/* Article 12 */}
                  <section id="article-12" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제12조(서비스의 중단)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                      <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 회원 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
                      <li>사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 회사는 제8조에 정한 방법으로 회원에게 통지하고 당초 회사에서 제시한 조건에 따라 소비자에게 보상합니다.</li>
                    </ol>
                  </section>

                  {/* Article 13 */}
                  <section id="article-13" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제13조(회원 탈퇴 및 자격 상실)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.</li>
                      <li>회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                        <ul className="list-disc pl-6 mt-2">
                          <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                          <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                          <li>서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                        </ul>
                      </li>
                      <li>회사가 회원 자격을 제한·정지 시킨 후, 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 회사는 회원자격을 상실시킬 수 있습니다.</li>
                    </ol>
                  </section>

                  {/* Article 14 */}
                  <section id="article-14" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제14조(손해배상)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 서비스에서 무료로 제공하는 서비스의 이용과 관련하여 개인정보처리방침에서 정하는 내용에 해당하지 않는 사항에 대하여는 어떠한 손해도 책임을 지지 않습니다.</li>
                      <li>회원이 본 약관의 규정을 위반함으로 인하여 회사에 손해가 발생하게 되는 경우, 본 약관을 위반한 회원은 회사에 발생하는 모든 손해를 배상하여야 합니다.</li>
                    </ol>
                  </section>

                  {/* Article 15 */}
                  <section id="article-15" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제15조(면책조항)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                      <li>회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                      <li>회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</li>
                      <li>회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다.</li>
                      <li>회사는 무료로 제공되는 서비스 이용과 관련하여 관련법에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
                    </ol>
                  </section>

                  {/* Article 16 */}
                  <section id="article-16" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">제16조(분쟁 해결)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
                      <li>회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 즉시 통보해 드립니다.</li>
                      <li>회사와 회원 간에 발생한 전자상거래 분쟁과 관련하여 회원의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.</li>
                      <li>회사와 회원 간 제기된 소송은 대한민국 법을 준거법으로 합니다.</li>
                    </ol>
                  </section>

                  {/* Addendum */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">부칙</h2>
                    <p>본 약관은 2025년 11월 21일부터 시행됩니다.</p>
                  </section>

                  {/* Contact */}
                  <section className="mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">{t('legal.terms.contact.title')}</h3>
                      <p>{t('legal.terms.contact.email')}</p>
                    </div>
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
                      These Terms of Service (hereinafter referred to as &quot;Terms&quot;) establish the rights, obligations, responsibilities, and other necessary matters between OCEANCODE (hereinafter referred to as &quot;the Company&quot;) and users regarding the use of the Gena service (hereinafter referred to as &quot;Service&quot;) provided by the Company.
                    </p>
                  </section>

                  {/* Article 2 */}
                  <section id="article-2" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 2 (Definitions)</h2>
                    <p>The definitions of terms used in these Terms are as follows:</p>
                    <ol className="list-decimal pl-6 space-y-2 mt-2">
                      <li><strong>&quot;Service&quot;</strong> refers to the AI-based web page summarization service provided by the Company.</li>
                      <li><strong>&quot;Member&quot;</strong> refers to a person who has agreed to these Terms and entered into a use agreement with the Company.</li>
                      <li><strong>&quot;ID&quot;</strong> refers to a combination of letters or numbers set by the Member and approved by the Company for Member identification and service use.</li>
                      <li><strong>&quot;Password&quot;</strong> refers to a combination of letters and numbers selected by the Member to verify that they match the assigned ID and protect the Member&apos;s rights and interests.</li>
                      <li><strong>&quot;Paid Service&quot;</strong> refers to various services provided by the Company for a fee.</li>
                    </ol>
                  </section>

                  {/* Article 3 */}
                  <section id="article-3" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 3 (Publication and Revision of Terms)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company posts the content of these Terms on the service&apos;s initial screen for easy access by Members.</li>
                      <li>The Company may revise these Terms as necessary within the scope that does not violate relevant laws.</li>
                      <li>When revising the Terms, the Company shall post both the current and revised Terms on the service&apos;s initial screen from at least 7 days before the effective date until the day before, clearly stating the effective date and reasons for revision. However, for revisions unfavorable to Members, notice shall be given at least 30 days in advance.</li>
                      <li>Members who do not agree to the revised Terms may request membership withdrawal. If they continue to use the Service after the effective date of the revised Terms, they are deemed to have agreed to the changes.</li>
                    </ol>
                  </section>

                  {/* Article 4 */}
                  <section id="article-4" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 4 (Interpretation of Terms)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>In addition to these Terms, the Company may establish separate terms of use and policies for individual services.</li>
                      <li>Matters not specified in these Terms shall be governed by relevant laws and general business practices.</li>
                    </ol>
                  </section>

                  {/* Article 5 */}
                  <section id="article-5" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 5 (Formation of Use Agreement)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>A use agreement is formed when a prospective member (hereinafter referred to as &quot;Applicant&quot;) agrees to these Terms, applies for membership, and the Company accepts such application.</li>
                      <li>The Company accepts Applicants&apos; applications in principle. However, the Company may not accept or may subsequently terminate use agreements for applications falling under any of the following:
                        <ul className="list-disc pl-6 mt-2">
                          <li>When the Applicant has previously lost membership status under these Terms</li>
                          <li>When using another person&apos;s name</li>
                          <li>When providing false information or not providing required information</li>
                          <li>When a minor under 14 years old applies without legal guardian consent</li>
                          <li>When approval is impossible due to the User&apos;s fault or when applying in violation of other regulations</li>
                        </ul>
                      </li>
                    </ol>
                  </section>

                  {/* Article 6 */}
                  <section id="article-6" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 6 (Member Registration)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Membership registration is completed by agreeing to these Terms and Privacy Policy, entering member information according to the Company&apos;s registration form, and clicking buttons such as &quot;Sign Up&quot; or &quot;Confirm.&quot;</li>
                      <li>The Company registers as members those who applied for membership under Paragraph 1, unless they fall under any of the following:
                        <ul className="list-disc pl-6 mt-2">
                          <li>When registration content contains false information, omissions, or errors</li>
                          <li>When the Company determines that registration would significantly hinder its technical operations</li>
                        </ul>
                      </li>
                      <li>The membership agreement is formed when the Company&apos;s acceptance reaches the Member.</li>
                    </ol>
                  </section>

                  {/* Article 7 */}
                  <section id="article-7" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 7 (Changes to Member Information)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Members may view and modify their personal information at any time through the personal information management screen.</li>
                      <li>When information provided during membership registration changes, Members must modify it online or notify the Company of the changes via email or other methods.</li>
                      <li>The Company is not responsible for disadvantages arising from failure to notify the Company of changes in Paragraph 2.</li>
                    </ol>
                  </section>

                  {/* Article 8 */}
                  <section id="article-8" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 8 (Privacy Protection)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company strives to protect Members&apos; personal information in accordance with relevant laws.</li>
                      <li>Protection of Members&apos; personal information shall be governed by relevant laws and the Company&apos;s &quot;Privacy Policy.&quot;</li>
                      <li>The Company is not responsible for information disclosed due to Members&apos; fault.</li>
                    </ol>
                  </section>

                  {/* Article 9 */}
                  <section id="article-9" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 9 (Company Obligations)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company does not engage in acts prohibited by law or these Terms or contrary to public morals, and makes best efforts to provide services continuously and stably.</li>
                      <li>The Company must maintain security systems to protect personal information (including credit information) for safe service use by Members and must disclose and comply with its Privacy Policy.</li>
                      <li>The Company shall address opinions or complaints raised by Members regarding service use when deemed legitimate. The Company communicates processing procedures and results to Members through bulletin boards or email for complaints or opinions raised by Members.</li>
                    </ol>
                  </section>

                  {/* Article 10 */}
                  <section id="article-10" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 10 (Member Obligations)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Members shall not engage in the following acts:
                        <ul className="list-disc pl-6 mt-2">
                          <li>Registering false information during application or changes</li>
                          <li>Misappropriating others&apos; information</li>
                          <li>Modifying information posted by the Company</li>
                          <li>Transmitting or posting information other than that designated by the Company (such as computer programs)</li>
                          <li>Infringing on the Company&apos;s or third parties&apos; intellectual property rights including copyrights</li>
                          <li>Damaging the reputation of the Company or third parties or interfering with their business</li>
                          <li>Disclosing or posting obscene or violent messages, images, audio, or other information contrary to public morals</li>
                          <li>Using the Service for commercial purposes</li>
                          <li>Other illegal or improper acts</li>
                        </ul>
                      </li>
                      <li>Members must comply with relevant laws, provisions of these Terms, usage guidelines, precautions announced regarding the Service, and matters notified by the Company, and shall not engage in acts interfering with the Company&apos;s business.</li>
                    </ol>
                  </section>

                  {/* Article 11 */}
                  <section id="article-11" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 11 (Service Provision and Changes)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company provides the following services:
                        <ul className="list-disc pl-6 mt-2">
                          <li>AI-based web page summarization service</li>
                          <li>Summary history management service</li>
                          <li>Chrome extension</li>
                          <li>Web dashboard service</li>
                          <li>All other services the Company additionally develops or provides to Members through partnership agreements with other companies</li>
                        </ul>
                      </li>
                      <li>When changing service content, the Company shall post the reasons for change, content of changed services, and provision date on the service screen at least 7 days before the change.</li>
                      <li>The Company may modify, suspend, or change part or all of free services based on Company policy and operational needs, and shall not provide separate compensation to Members unless specifically required by law.</li>
                    </ol>
                  </section>

                  {/* Article 12 */}
                  <section id="article-12" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 12 (Service Suspension)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company may temporarily suspend service provision for maintenance, replacement, or failure of information and communication facilities such as computers, communication disruptions, or substantial operational reasons.</li>
                      <li>The Company compensates for damages incurred by Members or third parties due to temporary service suspension under Paragraph 1. However, this does not apply when the Company proves lack of intent or negligence.</li>
                      <li>When unable to provide services due to business transformation, business abandonment, or company integration, the Company notifies Members through the method in Article 8 and compensates consumers according to originally presented conditions.</li>
                    </ol>
                  </section>

                  {/* Article 13 */}
                  <section id="article-13" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 13 (Withdrawal and Disqualification)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>Members may request withdrawal from the Company at any time, and the Company immediately processes membership withdrawal.</li>
                      <li>When Members fall under any of the following, the Company may restrict or suspend membership status:
                        <ul className="list-disc pl-6 mt-2">
                          <li>Registering false content during membership application</li>
                          <li>Threatening e-commerce order by interfering with others&apos; service use or misappropriating information</li>
                          <li>Using the Service to engage in acts prohibited by law or these Terms or contrary to public morals</li>
                        </ul>
                      </li>
                      <li>After restricting or suspending membership status, if the same act repeats twice or more or the cause is not corrected within 30 days, the Company may disqualify the member.</li>
                    </ol>
                  </section>

                  {/* Article 14 */}
                  <section id="article-14" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 14 (Damages)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company is not liable for any damages related to use of free services, except for matters specified in the Privacy Policy.</li>
                      <li>When Members cause damage to the Company by violating these Terms, violating Members must compensate the Company for all damages incurred.</li>
                    </ol>
                  </section>

                  {/* Article 15 */}
                  <section id="article-15" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 15 (Disclaimer)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company is exempt from liability for service provision when unable to provide services due to natural disasters or equivalent force majeure.</li>
                      <li>The Company is not liable for service use disruptions due to Members&apos; fault.</li>
                      <li>The Company is not liable for the reliability, accuracy, or content of information, materials, and facts posted by Members regarding the Service.</li>
                      <li>The Company is exempt from liability for transactions between Members or between Members and third parties mediated through the Service.</li>
                      <li>The Company is not liable for use of free services unless specifically required by law.</li>
                    </ol>
                  </section>

                  {/* Article 16 */}
                  <section id="article-16" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Article 16 (Dispute Resolution)</h2>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>The Company operates a damage compensation processing organization to reflect legitimate opinions or complaints raised by Members and process their damage compensation.</li>
                      <li>The Company prioritizes processing complaints and opinions submitted by Members. However, when prompt processing is difficult, the Company immediately notifies Members of the reasons and processing schedule.</li>
                      <li>For damage relief requests regarding e-commerce disputes between the Company and Members, the Company may follow mediation by dispute mediation organizations commissioned by the Fair Trade Commission or city/provincial governors.</li>
                      <li>Lawsuits between the Company and Members shall be governed by the laws of the Republic of Korea.</li>
                    </ol>
                  </section>

                  {/* Addendum */}
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Addendum</h2>
                    <p>These Terms shall be effective from November 21, 2025.</p>
                  </section>

                  {/* Contact */}
                  <section className="mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">{t('legal.terms.contact.title')}</h3>
                      <p>{t('legal.terms.contact.email')}</p>
                    </div>
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
        aria-label={t('legal.terms.backToTop')}
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}