// components/dashboard/StatsCard.tsx
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {(description || trend) && (
        <div className="flex items-center space-x-2 text-sm">
          {trend && (
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-gray-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}