// components/marketing/Footer.tsx
import Link from 'next/link';
import { Sparkles, Twitter, Github, Mail } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    product: [
      { name: '기능', href: '#features' },
      { name: '사용방법', href: '#how-it-works' },
      { name: '요금제', href: '#pricing' },
      { name: 'FAQ', href: '#faq' },
    ],
    company: [
      { name: '소개', href: '/about' },
      { name: '블로그', href: '/blog' },
      { name: '채용', href: '/careers' },
      { name: '문의', href: '/contact' },
    ],
    legal: [
      { name: '이용약관', href: '/terms' },
      { name: '개인정보처리방침', href: '/privacy' },
      { name: '환불정책', href: '/refund' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/summarygenie', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/summarygenie', label: 'GitHub' },
    { icon: Mail, href: 'mailto:support@summarygenie.app', label: 'Email' },
  ];

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SummaryGenie
              </span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm">
              AI 기반 웹페이지 요약으로
              <br />
              당신의 시간을 더 가치있게
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">제품</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">회사</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">법적 고지</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 SummaryGenie. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <span>🇰🇷 한국어</span>
              <span>•</span>
              <span>Made with ❤️ in Seoul</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}