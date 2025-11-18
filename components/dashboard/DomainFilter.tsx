// components/dashboard/DomainFilter.tsx
'use client';

import { useMemo } from 'react';
import { Filter } from 'lucide-react';
import { HistoryDocument } from '@/lib/firebase/types';
import { useTranslation } from '@/hooks/useTranslation';

interface DomainFilterProps {
  history: (HistoryDocument & { id: string })[];
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}

export default function DomainFilter({
  history,
  selectedDomain,
  onDomainChange,
}: DomainFilterProps) {
  const { t } = useTranslation();

  // 고유 도메인 목록 추출
  const domains = useMemo(() => {
    const domainSet = new Set<string>();
    
    history.forEach((item) => {
      if (item.metadata?.domain) {
        domainSet.add(item.metadata.domain);
      }
    });

    return Array.from(domainSet).sort();
  }, [history]);

  if (domains.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <select
        value={selectedDomain}
        onChange={(e) => onDomainChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
      >
        <option value="">{t('dashboard.history.filterAll')}</option>
        {domains.map((domain) => (
          <option key={domain} value={domain}>
            {domain}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}