'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  colorScheme: 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

const colorClasses = {
  neutral: {
    bg: 'bg-white',
    text: 'bg-gray-100 text-gray-700',
    border: 'border border-gray-200',
    cardBg: 'bg-white',
    shadow: 'shadow-sm hover:shadow-md',
  },
};

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  colorScheme, 
  format = 'number' 
}: MetricCardProps) {
  const colors = colorClasses[colorScheme];
  
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `₹${Number(val).toLocaleString('en-IN')}`;
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return Number(val).toLocaleString('en-IN');
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-700 bg-green-50 border border-green-200';
      case 'decrease':
        return 'text-red-700 bg-red-50 border border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <div className={`${colors.cardBg} rounded-lg ${colors.border} p-6 ${colors.shadow} transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-md ${colors.text}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>+{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="text-2xl font-semibold text-gray-900">
          {formatValue(value)}
        </h3>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {change && (
          <p className="text-xs text-gray-500">
            {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
            {Math.abs(change.value)}% from {change.period}
          </p>
        )}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
          <div className="h-5 w-14 bg-gray-200 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-md w-24"></div>
          <div className="h-4 bg-gray-200 rounded-md w-32"></div>
          <div className="h-3 bg-gray-200 rounded-md w-20"></div>
        </div>
      </div>
    </div>
  );
}