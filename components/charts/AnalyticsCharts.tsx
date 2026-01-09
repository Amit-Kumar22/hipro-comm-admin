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
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" stroke="#666" fontSize={12} />
      <YAxis stroke="#666" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Area 
        type="monotone" 
        dataKey="sales" 
        stroke="#3B82F6" 
        fill="url(#colorSales)" 
        strokeWidth={3}
      />
      <defs>
        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
);

export const OrdersChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="day" stroke="#666" fontSize={12} />
      <YAxis stroke="#666" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Bar dataKey="orders" fill="#10B981" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const CategoryPieChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={280}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={100}
        paddingAngle={2}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      />
    </PieChart>
  </ResponsiveContainer>
);

export const RevenueLineChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="day" stroke="#666" fontSize={12} />
      <YAxis stroke="#666" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#8B5CF6" 
        strokeWidth={3}
        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
        activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export const UserGrowthChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" stroke="#666" fontSize={12} />
      <YAxis stroke="#666" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Area 
        type="monotone" 
        dataKey="users" 
        stroke="#F59E0B" 
        fill="url(#colorUsers)" 
        strokeWidth={3}
      />
      <defs>
        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
        </linearGradient>
      </defs>
    </AreaChart>
  </ResponsiveContainer>
);

export const ComparisonChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" stroke="#666" fontSize={12} />
      <YAxis stroke="#666" fontSize={12} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      />
      <Legend />
      <Bar dataKey="thisYear" fill="#3B82F6" radius={[4, 4, 0, 0]} name="This Year" />
      <Bar dataKey="lastYear" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Last Year" />
    </BarChart>
  </ResponsiveContainer>
);