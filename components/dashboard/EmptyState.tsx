// components/dashboard/EmptyState.tsx
'use client';

import { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'compact' | 'large';
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const { locale } = useTranslation();

  const sizes = {
    compact: {
      icon: 'w-8 h-8',
      container: 'py-6',
      title: 'text-sm',
      description: 'text-xs',
    },
    default: {
      icon: 'w-12 h-12',
      container: 'py-12',
      title: 'text-base',
      description: 'text-sm',
    },
    large: {
      icon: 'w-16 h-16',
      container: 'py-16',
      title: 'text-lg',
      description: 'text-base',
    },
  };

  const size = sizes[variant];

  return (
    <div className={`text-center ${size.container}`}>
      <Icon className={`${size.icon} text-gray-300 mx-auto mb-3`} />
      <p className={`${size.title} font-medium text-gray-500 mb-2`}>
        {title}
      </p>
      {description && (
        <p className={`${size.description} text-gray-400 mb-4 max-w-sm mx-auto`}>
          {description}
        </p>
      )}
      {action && (
        <>
          {action.href ? (
            <a
              href={action.href}
              target={action.href.startsWith('http') ? '_blank' : undefined}
              rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
            >
              {action.label}
            </a>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
            >
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  );
}