/**
 * QueryResult - Component for displaying query results
 * Handles tabular data, charts, and SQL display
 */

import React, { useState } from 'react';
import { BarChart3, Table, PieChart, TrendingUp, Download, Copy, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import SQLViewer from './SQLViewer';
import toast from 'react-hot-toast';

const QueryResult = ({ result }) => {
  const [viewMode, setViewMode] = useState('table');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  if (!result || !result.success) {
    return null;
  }

  const { data, columns, sql, explanation, confidence, executionResult } = result;
  const hasData = data && data.length > 0;

  // Calculate pagination
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data?.slice(startIndex, endIndex) || [];

  // Prepare chart data
  const prepareChartData = () => {
    if (!hasData || !columns) return [];

    return data.map((row, index) => {
      const chartRow = { index: index + 1 };
      columns.forEach(col => {
        const value = row[col.name];
        // Convert to number if possible for charts
        chartRow[col.name] = isNaN(value) ? value : Number(value);
      });
      return chartRow;
    });
  };

  const chartData = prepareChartData();

  // Get numeric columns for charts
  const numericColumns = columns?.filter(col => 
    col.type === 'number' || 
    (typeof data?.[0]?.[col.name] === 'number')
  ) || [];

  // Get categorical columns for pie charts
  const categoricalColumns = columns?.filter(col => 
    col.type === 'string' || 
    (typeof data?.[0]?.[col.name] === 'string')
  ) || [];

  // Format cell values for display
  const formatCellValue = (value, column) => {
    if (value === null || value === undefined) return '-';
    
    // Check if it's a numeric column
    const isNumeric = numericColumns.some(col => col.name === column.name);
    
    if (isNumeric) {
      const numValue = Number(value);
      if (isNaN(numValue)) return value;
      
      // Format based on column name patterns
      if (column.name.toLowerCase().includes('rate') || 
          column.name.toLowerCase().includes('percentage') ||
          column.name.toLowerCase().includes('conversion')) {
        // Round to 2 decimal places and add % symbol
        return `${Math.round(numValue * 100) / 100}%`;
      } else if (column.name.toLowerCase().includes('amount') || 
                 column.name.toLowerCase().includes('price') || 
                 column.name.toLowerCase().includes('revenue') ||
                 column.name.toLowerCase().includes('sales')) {
        return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (column.name.toLowerCase().includes('count') || 
                 column.name.toLowerCase().includes('quantity')) {
        return numValue.toLocaleString('en-US');
      } else {
        // For other numeric values, round to 2 decimal places
        return Math.round(numValue * 100) / 100;
      }
    }
    
    return value;
  };

  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 2000);
      toast.success('SQL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy SQL');
    }
  };

  const handleExportData = () => {
    if (!hasData) return;

    const csvContent = [
      // Header
      columns.map(col => col.name).join(','),
      // Data rows
      ...data.map(row => 
        columns.map(col => {
          const value = row[col.name];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query-result-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-secondary-200">
        <thead className="bg-secondary-50">
          <tr>
            {columns?.map((col, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {currentData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-secondary-50">
              {columns?.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                >
                  {formatCellValue(row[col.name], col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBarChart = () => {
    if (numericColumns.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-secondary-500">
          No numeric data available for bar chart
        </div>
      );
    }

    const firstNumericCol = numericColumns[0];
    const xAxisCol = categoricalColumns[0] || 'index';

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisCol} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={firstNumericCol.name} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderLineChart = () => {
    if (numericColumns.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-secondary-500">
          No numeric data available for line chart
        </div>
      );
    }

    const firstNumericCol = numericColumns[0];
    const xAxisCol = categoricalColumns[0] || 'index';

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisCol} />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey={firstNumericCol.name} 
              stroke="#3b82f6" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderPieChart = () => {
    if (categoricalColumns.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-secondary-500">
          No categorical data available for pie chart
        </div>
      );
    }

    const categoryCol = categoricalColumns[0];
    const valueCol = numericColumns[0];

    // Group data by category
    const groupedData = data.reduce((acc, row) => {
      const category = row[categoryCol.name];
      const value = valueCol ? row[valueCol.name] : 1;
      
      if (acc[category]) {
        acc[category] += value;
      } else {
        acc[category] = value;
      }
      
      return acc;
    }, {});

    const pieData = Object.entries(groupedData).map(([name, value]) => ({
      name,
      value: Number(value)
    }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderTable();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-secondary-700">Results:</span>
            <span className="text-sm text-secondary-500">
              {data?.length || 0} rows
            </span>
          </div>
          {confidence && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary-500">Confidence:</span>
              <div className="w-16 bg-secondary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-sm text-secondary-500">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySQL}
            className="btn btn-outline btn-sm"
            title="Copy SQL"
          >
            {copiedSQL ? (
              <Check className="w-4 h-4 text-success-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            SQL
          </button>
          <button
            onClick={handleExportData}
            className="btn btn-outline btn-sm"
            title="Export data"
            disabled={!hasData}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* View mode selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-secondary-700">View:</span>
        <div className="flex border border-secondary-300 rounded-lg overflow-hidden">
          {[
            { key: 'table', label: 'Table', icon: Table },
            { key: 'bar', label: 'Bar Chart', icon: BarChart3 },
            { key: 'line', label: 'Line Chart', icon: TrendingUp },
            { key: 'pie', label: 'Pie Chart', icon: PieChart },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="border border-secondary-200 rounded-lg overflow-hidden">
        {hasData ? (
          <>
            {renderChart()}
            
            {/* Pagination for table view */}
            {viewMode === 'table' && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-secondary-50 border-t border-secondary-200">
                <div className="text-sm text-secondary-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-secondary-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-outline btn-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-secondary-500">
            No data returned
          </div>
        )}
      </div>

      {/* SQL Query */}
      {sql && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-secondary-700">Generated SQL:</h4>
            <button
              onClick={handleCopySQL}
              className="btn btn-outline btn-sm"
            >
              {copiedSQL ? (
                <Check className="w-4 h-4 text-success-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy
            </button>
          </div>
          <SQLViewer sql={sql} />
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-700">Explanation:</h4>
          <div className="prose prose-sm max-w-none bg-secondary-50 p-4 rounded-lg">
            <p className="text-secondary-700">{explanation}</p>
          </div>
        </div>
      )}

      {/* Execution info */}
      {executionResult && (
        <div className="text-xs text-secondary-500 space-y-1">
          <div>Execution time: {executionResult.executionTime}ms</div>
          <div>Rows returned: {executionResult.rowCount}</div>
        </div>
      )}
    </div>
  );
};

export default QueryResult;
