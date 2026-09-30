import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'teal';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * StatCard component - Displays key metrics in a card format
 * Used throughout the dashboard for showing statistics
 */
export default function StatCard({ title, value, icon: Icon, color, subtitle, trend }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500'
  };

  const bgColorClasses = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    teal: 'bg-teal-50'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`${bgColorClasses[color]} p-3 rounded-lg`}>
          <Icon size={24} className={`${colorClasses[color]} text-white p-1 rounded`} />
        </div>
      </div>
    </div>
  );
}
