/**
 * Dashboard - E-commerce Analytics Dashboard
 * Beautiful and colorful dashboard with key metrics and insights
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useNLQActions } from '../store/nlqStore';
import { dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { setCurrentView, setCurrentQuery } = useNLQActions();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample e-commerce data for demonstration - moved inside useEffect
  const sampleData = useMemo(() => ({
    metrics: {
      totalRevenue: 125430,
      totalOrders: 2847,
      totalCustomers: 1842,
      conversionRate: 3.2,
      averageOrderValue: 44.12,
      totalProducts: 156,
      returnRate: 2.1,
      customerSatisfaction: 4.7
    },
    revenueData: [
      { month: 'Jan', revenue: 12000, orders: 240 },
      { month: 'Feb', revenue: 15000, orders: 300 },
      { month: 'Mar', revenue: 18000, orders: 360 },
      { month: 'Apr', revenue: 22000, orders: 440 },
      { month: 'May', revenue: 25000, orders: 500 },
      { month: 'Jun', revenue: 28000, orders: 560 },
      { month: 'Jul', revenue: 32000, orders: 640 },
      { month: 'Aug', revenue: 35000, orders: 700 },
      { month: 'Sep', revenue: 38000, orders: 760 },
      { month: 'Oct', revenue: 42000, orders: 840 },
      { month: 'Nov', revenue: 45000, orders: 900 },
      { month: 'Dec', revenue: 48000, orders: 960 }
    ],
    topProducts: [
      { name: 'Wireless Headphones', sales: 450, revenue: 22500, growth: 12.5 },
      { name: 'Smart Watch', sales: 320, revenue: 19200, growth: 8.3 },
      { name: 'Laptop Stand', sales: 280, revenue: 8400, growth: 15.2 },
      { name: 'Phone Case', sales: 650, revenue: 6500, growth: -2.1 },
      { name: 'Bluetooth Speaker', sales: 180, revenue: 9000, growth: 22.7 }
    ],
    categoryData: [
      { name: 'Electronics', value: 35, color: '#8B5CF6' },
      { name: 'Clothing', value: 25, color: '#06B6D4' },
      { name: 'Home & Garden', value: 20, color: '#10B981' },
      { name: 'Sports', value: 12, color: '#F59E0B' },
      { name: 'Books', value: 8, color: '#EF4444' }
    ],
    recentOrders: [
      { id: '#12345', customer: 'John Doe', product: 'Wireless Headphones', amount: 89.99, status: 'Delivered' },
      { id: '#12346', customer: 'Jane Smith', product: 'Smart Watch', amount: 199.99, status: 'Shipped' },
      { id: '#12347', customer: 'Mike Johnson', product: 'Laptop Stand', amount: 29.99, status: 'Processing' },
      { id: '#12348', customer: 'Sarah Wilson', product: 'Phone Case', amount: 19.99, status: 'Delivered' },
      { id: '#12349', customer: 'David Brown', product: 'Bluetooth Speaker', amount: 49.99, status: 'Shipped' }
    ]
  }), []);

  useEffect(() => {
    // Load dashboard data from backend API
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const response = await dashboardAPI.getAllData();
        if (response.success) {
          setDashboardData(response.data);
          toast.success('Dashboard data loaded successfully!');
        } else {
          throw new Error(response.error || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard data. Using sample data.');
        // Fallback to sample data if API fails
        setDashboardData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [sampleData]);

  const handleQuickQuery = async (query) => {
    setCurrentQuery(query);
    setCurrentView('chat');
    toast.success('Query ready! Switch to chat to see results.');
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val}%`;
      if (format === 'rating') return `${val}/5`;
      return val.toLocaleString();
    };

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatValue(value)}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color} flex-shrink-0 ml-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="loading-dots mx-auto mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              E-commerce Analytics Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Real-time insights and performance metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setCurrentView('chat')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Ask Questions</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <MetricCard
          title="Total Sales Value"
          value={dashboardData?.metrics.totalRevenue}
          change={12.5}
          icon={DollarSign}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          format="currency"
        />
        <MetricCard
          title="Total Orders"
          value={dashboardData?.metrics.totalOrders}
          change={8.3}
          icon={ShoppingCart}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
        />
        <MetricCard
          title="Total Customers"
          value={dashboardData?.metrics.totalCustomers}
          change={15.2}
          icon={Users}
          color="bg-gradient-to-r from-purple-500 to-pink-500"
        />
        <MetricCard
          title="Conversion Rate"
          value={dashboardData?.metrics.conversionRate}
          change={-2.1}
          icon={TrendingUp}
          color="bg-gradient-to-r from-orange-500 to-red-500"
          format="percentage"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales Value Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Value Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData?.revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={dashboardData?.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData?.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

     

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Analytics Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            "Show me top selling products this month",
            "What's our conversion rate by category?",
            "Which customers have the highest lifetime value?",
            "How are our sales trending compared to last year?",
            "What's the average order value by region?",
            "Show me products with low inventory",
            "Which marketing channels drive the most sales?",
            "What's our customer retention rate?"
          ].map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuery(question)}
              className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-300 text-left text-xs sm:text-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
