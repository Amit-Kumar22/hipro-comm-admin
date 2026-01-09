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
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  format?: 'number' | 'currency' | 'percentage';
}

const colorClasses = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
    text: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/30',
    border: 'border-2 border-blue-200/50',
    cardBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    shadow: 'shadow-2xl shadow-blue-500/20 hover:shadow-3xl hover:shadow-blue-500/30',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    text: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/30',
    border: 'border-2 border-green-200/50',
    cardBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    shadow: 'shadow-2xl shadow-green-500/20 hover:shadow-3xl hover:shadow-green-500/30',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
    text: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30',
    border: 'border-2 border-purple-200/50',
    cardBg: 'bg-gradient-to-br from-purple-50 to-pink-50',
    shadow: 'shadow-2xl shadow-purple-500/20 hover:shadow-3xl hover:shadow-purple-500/30',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
    text: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/30',
    border: 'border-2 border-orange-200/50',
    cardBg: 'bg-gradient-to-br from-orange-50 to-yellow-50',
    shadow: 'shadow-2xl shadow-orange-500/20 hover:shadow-3xl hover:shadow-orange-500/30',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50',
    text: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl shadow-red-500/30',
    border: 'border-2 border-red-200/50',
    cardBg: 'bg-gradient-to-br from-red-50 to-pink-50',
    shadow: 'shadow-2xl shadow-red-500/20 hover:shadow-3xl hover:shadow-red-500/30',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50',
    text: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-xl shadow-indigo-500/30',
    border: 'border-2 border-indigo-200/50',
    cardBg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    shadow: 'shadow-2xl shadow-indigo-500/20 hover:shadow-3xl hover:shadow-indigo-500/30',
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
        return 'text-emerald-700 bg-gradient-to-r from-emerald-100 to-green-100 shadow-lg';
      case 'decrease':
        return 'text-red-700 bg-gradient-to-r from-red-100 to-pink-100 shadow-lg';
      default:
        return 'text-gray-700 bg-gradient-to-r from-gray-100 to-slate-100 shadow-lg';
    }
  };

  return (
    <div className={`${colors.cardBg} rounded-2xl ${colors.border} border p-5 ${colors.shadow} transition-all duration-300 hover:scale-105`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.text}`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>+{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {formatValue(value)}
        </h3>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {change && (
          <p className="text-xs text-gray-600 font-medium">
            {change.type === 'increase' ? '📈 +' : change.type === 'decrease' ? '📉 -' : '➖ '}
            {Math.abs(change.value)}% from {change.period}
          </p>
        )}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200/50 p-5 shadow-2xl shadow-gray-500/10">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
        </div>
        <div className="space-y-2">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20"></div>
        </div>
      </div>
    </div>
  );
}