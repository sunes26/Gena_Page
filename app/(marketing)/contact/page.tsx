// app/(marketing)/contact/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContactPage() {
  const { t } = useTranslation();

  const contactMethods = [
    {
      icon: Mail,
      title: t('contact.methods.email.title'),
      description: t('contact.methods.email.description'),
      action: t('contact.methods.email.action'),
      href: 'mailto:oceancode0321@gmail.com',
      primary: true,
    },
    {
      icon: MessageCircle,
      title: t('contact.methods.support.title'),
      description: t('contact.methods.support.description'),
      action: t('contact.methods.support.action'),
      href: '/settings',
      primary: false,
    },
    {
      icon: FileText,
      title: t('contact.methods.docs.title'),
      description: t('contact.methods.docs.description'),
      action: t('contact.methods.docs.action'),
      href: '#faq',
      primary: false,
    },
  ];

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
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft size={16} />
              {t('common.back')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('contact.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.hero.subtitle')}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-6">{method.description}</p>
                <Link
                  href={method.href}
                  className={`inline-block px-6 py-3 rounded-lg font-semibold transition ${
                    method.primary
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {method.action}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {t('contact.info.title')}
          </h2>
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">{t('contact.info.email.label')}</p>
                <a
                  href="mailto:oceancode0321@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  oceancode0321@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold">{t('contact.info.response.label')}</p>
                <p className="text-gray-600">{t('contact.info.response.time')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">{t('contact.cta.title')}</h2>
          <p className="text-lg mb-6 opacity-90">
            {t('contact.cta.subtitle')}
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {t('contact.cta.button')}
          </Link>
        </div>
      </div>
    </div>
  );
}
