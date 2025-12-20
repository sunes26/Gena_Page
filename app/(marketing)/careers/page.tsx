// app/(marketing)/careers/page.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft, Briefcase, Heart, Rocket, Coffee } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function CareersPage() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Rocket,
      title: t('careers.benefits.growth.title'),
      description: t('careers.benefits.growth.description'),
    },
    {
      icon: Heart,
      title: t('careers.benefits.culture.title'),
      description: t('careers.benefits.culture.description'),
    },
    {
      icon: Coffee,
      title: t('careers.benefits.flexibility.title'),
      description: t('careers.benefits.flexibility.description'),
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Briefcase className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('careers.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('careers.hero.subtitle')}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-10">
            {t('careers.benefits.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white rounded-lg shadow-sm p-6 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* No Openings Section */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t('careers.openings.noPositions.title')}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('careers.openings.noPositions.description')}
          </p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {t('careers.openings.noPositions.contactButton')}
          </Link>
        </div>

        {/* Future Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            {t('careers.future.title')}
          </h2>
          <p className="text-lg opacity-90">
            {t('careers.future.description')}
          </p>
        </div>
      </div>
    </div>
  );
}
