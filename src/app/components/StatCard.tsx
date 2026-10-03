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

/** Apple Health–style colours: shown on the icon and label only */
const accent: Record<StatCardProps['color'], string> = {
  green: '#1E8A5A',
  blue: '#007AFF',
  purple: '#AF52DE',
  orange: '#E08600',
  teal: '#0E9AAD',
};

/**
 * StatCard — key metric tile, Apple Health style.
 * Same props as before, so every page that uses it keeps working.
 */
export default function StatCard({ title, value, icon: Icon, color, subtitle, trend }: StatCardProps) {
  return (
    <div className="h-full flex flex-col bg-white rounded-2xl p-5">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: accent[color] }}>
        <Icon size={15} strokeWidth={2.25} />
        {title}
      </p>
      <p className="mt-2 text-[28px] leading-tight font-semibold tracking-[-0.02em] tabular-nums text-[#1D1D1F]">
        {value}
      </p>
      {subtitle && <p className="text-[13px] text-[#6E6E73] mt-0.5">{subtitle}</p>}
      {trend && (
        <p className="mt-auto pt-3 text-[12px] text-[#6E6E73]">
          <span className="font-medium" style={{ color: trend.isPositive ? '#248A3D' : '#D70015' }}>
            {trend.isPositive ? '+' : '−'}{Math.abs(trend.value)}%
          </span>{' '}
          vs last month
        </p>
      )}
    </div>
  );
}
