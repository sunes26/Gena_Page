// components/dashboard/HistoryModal.tsx
'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ExternalLink, Copy, Check, Calendar, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { enUS } from 'date-fns/locale/en-US';
import { HistoryDocument } from '@/lib/firebase/types';
import { useTranslation } from '@/hooks/useTranslation';

interface HistoryModalProps {
  item: (HistoryDocument & { id: string }) | null;
  onClose: () => void;
}

export default function HistoryModal({ item, onClose }: HistoryModalProps) {
  const { t, locale } = useTranslation();
  const [copied, setCopied] = useState(false);

  const isOpen = !!item;

  // ✅ summary 또는 content 가져오기 (summary 우선)
  const getSummaryContent = (item: HistoryDocument & { id: string }) => {
    return item.summary || item.content || '';
  };

  // 복사하기
  const handleCopy = async () => {
    if (item) {
      const content = getSummaryContent(item);
      if (content) {
        try {
          await navigator.clipboard.writeText(content);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
      }
    }
  };

  if (!item) return null;

  const dateLocale = locale === 'ko' ? ko : enUS;
  const createdDate = format(item.createdAt.toDate(), 'PPP (EEE) p', { locale: dateLocale });
  const summaryContent = getSummaryContent(item);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* 배경 오버레이 */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* 모달 패널 */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* 헤더 */}
                <div className="relative border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white p-6">
                  {/* 닫기 버튼 */}
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* 제목 */}
                  <Dialog.Title className="text-2xl font-bold text-gray-900 pr-12 mb-3">
                    {item.title || t('dashboard.modal.title')}
                  </Dialog.Title>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* 생성일 */}
                    <div className="flex items-center space-x-1.5 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{createdDate}</span>
                    </div>

                    {/* 도메인 */}
                    {item.metadata?.domain && (
                      <div className="flex items-center space-x-1.5">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {item.metadata.domain}
                        </span>
                      </div>
                    )}

                    {/* 글자 수 */}
                    {summaryContent && (
                      <div className="text-gray-500">
                        {summaryContent.length.toLocaleString()}{locale === 'ko' ? '자' : ' chars'}
                      </div>
                    )}
                  </div>
                </div>

                {/* 본문 */}
                <div className="max-h-[60vh] overflow-y-auto p-6">
                  {/* URL */}
                  {item.url && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                        {t('dashboard.modal.originalUrl')}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-2 break-all group"
                      >
                        <span className="flex-1">{item.url}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  )}

                  {/* 요약 내용 */}
                  {summaryContent ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {summaryContent}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Copy className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm">{t('dashboard.history.empty')}</p>
                    </div>
                  )}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>ID: {item.id.slice(0, 8)}...</span>
                  </div>

                  <div className="flex space-x-2">
                    {/* 닫기 버튼 */}
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      {t('dashboard.modal.close')}
                    </button>

                    {/* 복사 버튼 */}
                    <button
                      onClick={handleCopy}
                      disabled={!summaryContent || copied}
                      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
                        copied
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{t('dashboard.modal.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{t('dashboard.modal.copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}