/**
 * Beautiful NLQ Interface - Modern, responsive design with animations
 * Uses LangChain-powered backend for intelligent query processing
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, BarChart3, Table, Copy, Check, AlertCircle, Sparkles, Database, Zap, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { nlqAPI } from '../services/api';
import toast from 'react-hot-toast';

const SimpleNLQInterface = () => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const suggestions = [
    "Show me top 5 customers by order value",
    "What are the best selling products this month?",
    "How much revenue did we make last week?",
    "Which categories have the highest sales?",
    "Show me recent orders from VIP customers",
    "What's our conversion rate this quarter?",
    "Which products are running low on inventory?",
    "Show me sales trends by region"
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setShowSuggestions(false);

    try {
      const response = await nlqAPI.processQuery(query.trim(), {
        maxResults: 1000
      });

      if (response.success) {
        console.log('API Response:', response);
        console.log('Result data:', response.result?.data);
        console.log('Result columns:', response.result?.columns);
        setResult(response);
        toast.success('Query processed successfully! 🎉');
      } else {
        throw new Error(response.error || 'Query processing failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleCopySQL = async () => {
    const sql = result?.generatedSQL || result?.sql;
    if (!sql) return;
    
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 2000);
      toast.success('SQL copied to clipboard! 📋');
    } catch (error) {
      toast.error('Failed to copy SQL');
    }
  };

  const formatValue = (value, columnName) => {
    if (value === null || value === undefined) return '-';
    
    // Check if it's a numeric value
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      if (columnName.toLowerCase().includes('rate') || 
          columnName.toLowerCase().includes('percentage') ||
          columnName.toLowerCase().includes('conversion')) {
        return `${numValue.toFixed(2)}%`;
      } else if (columnName.toLowerCase().includes('amount') || 
                 columnName.toLowerCase().includes('price') || 
                 columnName.toLowerCase().includes('revenue') ||
                 columnName.toLowerCase().includes('sales') ||
                 columnName.toLowerCase().includes('value')) {
        return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (columnName.toLowerCase().includes('count') || 
                 columnName.toLowerCase().includes('quantity')) {
        return numValue.toLocaleString('en-US');
      } else {
        return numValue.toFixed(2);
      }
    }
    
    return value;
  };

  const renderTable = () => {
    // Handle different response formats - check both result.data and result.result.data
    const data = result?.result?.data || result?.data || [];
    let columns = result?.result?.columns || result?.columns || [];
    
    console.log('RenderTable - result:', result);
    console.log('RenderTable - data:', data);
    console.log('RenderTable - columns:', columns);
    
    if (!data || data.length === 0) {
      console.log('RenderTable - No data available');
      return (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No data available</p>
        </div>
      );
    }
    
    // If no columns defined, infer from first row
    if (columns.length === 0 && data.length > 0) {
      columns = Object.keys(data[0]).map(key => ({ name: key }));
      console.log('RenderTable - Inferred columns:', columns);
    }

    return (
      <div className="overflow-x-auto">
        <table className="table-modern">
          <thead>
            <tr>
              {columns.map((col, index) => {
                const columnName = typeof col === 'string' ? col : col.name;
                console.log('Table header - col:', col, 'columnName:', columnName);
                return (
                  <th key={index}>
                    {columnName.replace(/_/g, ' ')}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              console.log('Table row - rowIndex:', rowIndex, 'row:', row);
              return (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => {
                    const columnName = typeof col === 'string' ? col : col.name;
                    const cellValue = row[columnName];
                    console.log('Table cell - col:', col, 'columnName:', columnName, 'cellValue:', cellValue);
                    return (
                      <td key={colIndex}>
                        {formatValue(cellValue, columnName)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderChart = () => {
    // Handle different response formats - check both result.data and result.result.data
    const data = result?.result?.data || result?.data || [];
    let columns = result?.result?.columns || result?.columns || [];
    
    console.log('RenderChart - result:', result);
    console.log('RenderChart - data:', data);
    console.log('RenderChart - columns:', columns);
    
    if (!data || data.length === 0) {
      console.log('RenderChart - No data available');
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No data available for chart</p>
        </div>
      );
    }
    
    // If no columns defined, infer from first row
    if (columns.length === 0 && data.length > 0) {
      columns = Object.keys(data[0]).map(key => ({ name: key }));
      console.log('RenderChart - Inferred columns:', columns);
    }

    // Find numeric columns for charting
    const numericColumns = columns.filter(col => {
      const columnName = typeof col === 'string' ? col : col.name;
      const sampleValue = data[0]?.[columnName];
      console.log('Chart numeric check - col:', col, 'columnName:', columnName, 'sampleValue:', sampleValue, 'isNumeric:', !isNaN(Number(sampleValue)));
      return sampleValue !== null && sampleValue !== undefined && !isNaN(Number(sampleValue));
    });
    
    console.log('Chart numeric columns:', numericColumns);

    if (numericColumns.length === 0) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No numeric data available for chart</p>
        </div>
      );
    }

    // Prepare chart data
    const chartData = data.map((row, index) => {
      const chartRow = { index: index + 1 };
      columns.forEach(col => {
        const columnName = typeof col === 'string' ? col : col.name;
        const value = row[columnName];
        chartRow[columnName] = isNaN(value) ? value : Number(value);
      });
      return chartRow;
    });

    const firstNumericCol = numericColumns[0];
    const firstNumericColName = typeof firstNumericCol === 'string' ? firstNumericCol : firstNumericCol.name;
    const categoricalCol = columns.find(col => {
      const columnName = typeof col === 'string' ? col : col.name;
      return columnName !== firstNumericColName && 
        data.some(row => typeof row[columnName] === 'string');
    }) || columns[0];
    
    const categoricalColName = typeof categoricalCol === 'string' ? categoricalCol : categoricalCol.name;
    
    console.log('Chart data preparation - firstNumericCol:', firstNumericCol, 'categoricalCol:', categoricalCol);
    console.log('Chart data preparation - firstNumericColName:', firstNumericColName, 'categoricalColName:', categoricalColName);
    console.log('Chart data preparation - chartData:', chartData);

    // Color palette for charts
    const colors = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

    return (
      <div className="chart-container h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={categoricalColName} 
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#9CA3AF"
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              stroke="#9CA3AF"
            />
            <Tooltip 
              formatter={(value, name) => [formatValue(value, name), name]}
              labelStyle={{ fontSize: 12, color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey={firstNumericColName} 
              fill="url(#colorGradient)" 
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mb-8 shadow-xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            AI Query Assistant
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ask questions about your data in plain English and get instant insights with intelligent SQL generation powered by AI
          </p>
        </div>

        {/* Query Input Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(query.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Ask a question about your data... (e.g., 'Show me top 10 customers by total orders')"
                className="input-modern w-full pl-16 pr-28 py-6 text-lg"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!query.trim() || isProcessing}
                className="btn-modern btn-primary absolute right-3 top-1/2 transform -translate-y-1/2 px-8 py-4"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-3 glass-card z-50 max-h-64 overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular Queries
                  </h3>
                  <div className="space-y-2">
                    {suggestions
                      .filter(suggestion => 
                        suggestion.toLowerCase().includes(query.toLowerCase())
                      )
                      .slice(0, 6)
                      .map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-colors duration-200 flex items-center gap-3"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {suggestion}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 animate-slide-down">
            <div className="modern-card border-red-200 bg-red-50">
              <div className="modern-card-content">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-1">Oops! Something went wrong</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {/* Result Header */}
            <div className="modern-card mb-8">
              <div className="modern-card-content">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Query Results</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      {result?.result?.rowCount || result?.rowCount || 0} rows returned
                      {result?.truncated && ` (showing first ${result?.result?.rowCount || result?.rowCount || 0} of ${result?.totalRows})`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'table'
                          ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <Table className="w-4 h-4" />
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('chart')}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'chart'
                          ? 'bg-white text-gray-900 shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      Chart
                    </button>
                  </div>

                  {/* Copy SQL Button */}
                  <button
                    onClick={handleCopySQL}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-300 flex items-center gap-2 font-semibold text-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {copiedSQL ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Copy SQL</span>
                  </button>
                </div>
              </div>

              {/* Generated SQL */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Generated SQL Query
                  </h3>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <code className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {result?.generatedSQL || result?.sql}
                  </code>
                </div>
              </div>
              </div>
            </div>

            {/* Data Display */}
            <div className="modern-card">
              <div className="modern-card-content">
                {viewMode === 'table' ? renderTable() : renderChart()}
              </div>
            </div>

            {/* Relevant Tables Info */}
            {result.relevantTables && result.relevantTables.length > 0 && (
              <div className="mt-8 modern-card animate-fade-in-up">
                <div className="modern-card-content">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    Relevant Tables Used
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.relevantTables.map((table, index) => (
                      <div 
                        key={index} 
                        className="modern-card hover:scale-105"
                      >
                        <div className="modern-card-content">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                              <Database className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg">{table.tableName}</h4>
                          </div>
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">{table.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-full font-semibold">
                              {(table.similarity * 100).toFixed(1)}% match
                            </span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                                style={{ width: `${table.similarity * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p className="text-sm">Powered by AI • Built with React & LangChain</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleNLQInterface;