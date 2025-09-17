/**
 * Sidebar - Application sidebar component
 * Displays query history, schema info, and settings
 */

import React, { useState } from 'react';
import { 
  History, 
  Database, 
  Settings, 
  Trash2, 
  Download, 
  Upload,
  RefreshCw,
  Table,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import useNLQStore, { useNLQActions } from '../store/nlqStore';
import { nlqAPI } from '../services/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('history');

  const {
    queryHistory,
    schema,
    schemaLoading,
    settings
  } = useNLQStore();

  const {
    clearHistory,
    exportHistory,
    importHistory,
    updateSettings,
    setCurrentView,
    setCurrentQuery
  } = useNLQActions();

  // const toggleSection = (section) => {
  //   setExpandedSections(prev => ({
  //     ...prev,
  //     [section]: !prev[section]
  //   }));
  // };

  const handleRefreshSchema = async () => {
    try {
      await nlqAPI.refreshSchema();
      toast.success('Schema refreshed successfully');
      // The schema will be updated through the store
    } catch (error) {
      toast.error('Failed to refresh schema');
    }
  };

  const handleImportHistory = (event) => {
    const file = event.target.files[0];
    if (file) {
      importHistory(file)
        .then(() => toast.success('History imported successfully'))
        .catch(() => toast.error('Failed to import history'));
    }
  };

  const handleExportHistory = () => {
    exportHistory();
    toast.success('History exported successfully');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const renderHistory = () => (
    <div className="space-y-2">
      {queryHistory.length === 0 ? (
        <div className="text-center py-8 text-secondary-500">
          <History className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
          <p className="text-sm">No queries yet</p>
          <p className="text-xs">Start asking questions to see them here</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {queryHistory.slice(0, 20).map((entry, index) => (
            <div
              key={entry.id || index}
              className="p-2 rounded-lg hover:bg-secondary-50 cursor-pointer group"
            >
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  entry.type === 'user' ? 'bg-primary-500' :
                  entry.type === 'error' ? 'bg-error-500' : 'bg-success-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-secondary-900 truncate">
                    {entry.query}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {queryHistory.length > 0 && (
        <div className="pt-2 border-t border-secondary-200">
          <div className="flex gap-1">
            <button
              onClick={handleExportHistory}
              className="flex-1 btn btn-outline btn-sm"
              title="Export history"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={handleClearHistory}
              className="flex-1 btn btn-outline btn-sm text-error-600 hover:bg-error-50"
              title="Clear history"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSchema = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary-700">Database Schema</span>
        <button
          onClick={handleRefreshSchema}
          disabled={schemaLoading}
          className="p-1 hover:bg-secondary-100 rounded transition-colors"
          title="Refresh schema"
        >
          <RefreshCw className={`w-4 h-4 text-secondary-500 ${schemaLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {schemaLoading ? (
        <div className="text-center py-4 text-secondary-500">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading schema...</p>
        </div>
      ) : schema ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Object.entries(schema).map(([tableName, columns]) => (
            <div key={tableName} className="border border-secondary-200 rounded-lg">
              <div className="p-2 bg-secondary-50 border-b border-secondary-200">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-secondary-600" />
                  <span className="text-sm font-medium text-secondary-900">
                    {tableName}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-1">
                {columns.map((column, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-secondary-600">
                      {column.column_name}
                    </span>
                    <span className="text-secondary-500">
                      {column.data_type}
                    </span>
                    {!column.is_nullable && (
                      <span className="text-error-500">*</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-secondary-500">
          <Database className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
          <p className="text-sm">No schema available</p>
          <p className="text-xs">Check your database connection</p>
        </div>
      )}
    </div>
  );

  const renderQuickActions = () => {
    const quickActions = [
      {
        category: 'Sales Analytics',
        icon: DollarSign,
        color: 'bg-green-500',
        queries: [
          'Show me total revenue for this month',
          'What are the top selling products?',
          'How is our conversion rate trending?',
          'Which customers have the highest lifetime value?'
        ]
      },
      {
        category: 'Customer Insights',
        icon: Users,
        color: 'bg-blue-500',
        queries: [
          'Show me customer acquisition trends',
          'What is our customer retention rate?',
          'Which regions have the most customers?',
          'Show me customer demographics'
        ]
      },
      {
        category: 'Product Performance',
        icon: Package,
        color: 'bg-purple-500',
        queries: [
          'Which products have low inventory?',
          'Show me product return rates',
          'What are the most reviewed products?',
          'Which categories perform best?'
        ]
      },
      {
        category: 'Marketing Analytics',
        icon: TrendingUp,
        color: 'bg-orange-500',
        queries: [
          'Which marketing channels drive most sales?',
          'Show me campaign performance',
          'What is our average order value by source?',
          'How effective are our promotions?'
        ]
      }
    ];

    const handleQuickQuery = async (query) => {
      setCurrentView('chat');
      setCurrentQuery(query);
      // The query will be processed when the user goes to chat view
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Analytics</h3>
          <p className="text-sm text-gray-600">Click any question to start analyzing</p>
        </div>
        
        {quickActions.map((action, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 ml-3">{action.category}</h4>
            </div>
            <div className="space-y-2">
              {action.queries.map((query, queryIndex) => (
                <button
                  key={queryIndex}
                  onClick={() => handleQuickQuery(query)}
                  className="w-full text-left p-2 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200 hover:scale-105"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-700">
            Auto Execute
          </label>
          <input
            type="checkbox"
            checked={settings.autoExecute}
            onChange={(e) => updateSettings({ autoExecute: e.target.checked })}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-700">
            Show Explanation
          </label>
          <input
            type="checkbox"
            checked={settings.showExplanation}
            onChange={(e) => updateSettings({ showExplanation: e.target.checked })}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-700">
            Enable Suggestions
          </label>
          <input
            type="checkbox"
            checked={settings.enableSuggestions}
            onChange={(e) => updateSettings({ enableSuggestions: e.target.checked })}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-secondary-700">
            Enable Charts
          </label>
          <input
            type="checkbox"
            checked={settings.enableCharts}
            onChange={(e) => updateSettings({ enableCharts: e.target.checked })}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-secondary-700 block mb-1">
            Max Results
          </label>
          <input
            type="number"
            value={settings.maxResults}
            onChange={(e) => updateSettings({ maxResults: parseInt(e.target.value) || 1000 })}
            className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min="1"
            max="10000"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-secondary-700 block mb-1">
            Default Chart Type
          </label>
          <select
            value={settings.chartType}
            onChange={(e) => updateSettings({ chartType: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="table">Table</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
      </div>
      
      <div className="pt-4 border-t border-secondary-200">
        <div className="space-y-2">
          <button
            onClick={handleExportHistory}
            className="w-full btn btn-outline btn-sm"
          >
            <Download className="w-4 h-4" />
            Export History
          </button>
          
          <label className="w-full btn btn-outline btn-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Import History
            <input
              type="file"
              accept=".json"
              onChange={handleImportHistory}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'quick', label: 'Quick Actions', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History, count: queryHistory.length },
    { id: 'schema', label: 'Schema', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-secondary-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-secondary-200 text-secondary-700 text-xs px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'quick' && renderQuickActions()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'schema' && renderSchema()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default Sidebar;
