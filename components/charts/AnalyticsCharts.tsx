'use client';

import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';

export const SalesChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Area 
        type="monotone" 
        dataKey="sales" 
        stroke="#374151" 
        fill="url(#colorSales)" 
        strokeWidth={2}
      />
      <defs>
        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#374151" stopOpacity={0.1}/>
          <stop offset="95%" stopColor="#374151" stopOpacity={0.05}/>
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
);

export const OrdersChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Bar dataKey="orders" fill="#6b7280" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const CategoryPieChart = ({ data }: { data: any[] }) => {
  // Use neutral color palette
  const neutralColors = ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'];
  const dataWithNeutralColors = data.map((item, index) => ({
    ...item,
    color: neutralColors[index % neutralColors.length]
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={dataWithNeutralColors}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {dataWithNeutralColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const RevenueLineChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#374151" 
        strokeWidth={2}
        dot={{ fill: '#374151', strokeWidth: 1, r: 3 }}
        activeDot={{ r: 5, stroke: '#374151', strokeWidth: 1 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const UserGrowthChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Area 
        type="monotone" 
        dataKey="users" 
        stroke="#6b7280" 
        fill="url(#colorUsers)" 
        strokeWidth={2}
      />
      <defs>
        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6b7280" stopOpacity={0.1}/>
          <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05}/>
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
);

export const ComparisonChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
      <YAxis stroke="#6b7280" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Legend />
      <Bar dataKey="thisYear" fill="#374151" radius={[4, 4, 0, 0]} name="This Year" />
      <Bar dataKey="lastYear" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Last Year" />
    </BarChart>
  </ResponsiveContainer>
);