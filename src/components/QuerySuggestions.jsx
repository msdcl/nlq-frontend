/**
 * QuerySuggestions - Component for displaying query suggestions
 * Provides quick access to common queries and examples
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, Star, TrendingUp, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { nlqAPI } from '../services/api';

const QuerySuggestions = ({ onSuggestionClick, className = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default suggestions
  const defaultSuggestions = useMemo(() => [
    {
      id: 'top-customers',
      query: 'Show me the top 10 customers by total spending',
      category: 'Customer Analytics',
      icon: TrendingUp,
      description: 'Find customers with highest lifetime value'
    },
    {
      id: 'monthly-revenue',
      query: 'What is the total revenue for this month?',
      category: 'Sales Analytics',
      icon: DollarSign,
      description: 'Calculate monthly revenue with growth trends'
    },
    {
      id: 'top-products',
      query: 'Which products are selling best this quarter?',
      category: 'Product Performance',
      icon: BarChart3,
      description: 'Identify top performing products by sales'
    },
    {
      id: 'conversion-rate',
      query: 'What is our conversion rate by traffic source?',
      category: 'Marketing Analytics',
      icon: Users,
      description: 'Analyze marketing channel effectiveness'
    },
    {
      id: 'inventory-alert',
      query: 'Show me products with low inventory',
      category: 'Inventory Management',
      icon: Star,
      description: 'Identify products that need restocking'
    },
    {
      id: 'customer-retention',
      query: 'What is our customer retention rate?',
      category: 'Customer Insights',
      icon: Calendar,
      description: 'Measure customer loyalty and retention'
    },
    {
      id: 'geographic-sales',
      query: 'Which regions have the highest sales?',
      category: 'Geographic Analysis',
      icon: BarChart3,
      description: 'Analyze sales performance by location'
    },
    {
      id: 'seasonal-trends',
      query: 'How do our sales vary by season?',
      category: 'Trend Analysis',
      icon: TrendingUp,
      description: 'Identify seasonal sales patterns'
    }
  ], []);

  // Load suggestions from API
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.trim().length === 0) {
        setSuggestions(defaultSuggestions);
        return;
      }

      setLoading(true);
      try {
        const result = await nlqAPI.getSuggestions(searchQuery);
        if (result.success && result.suggestions) {
          const apiSuggestions = result.suggestions.map((suggestion, index) => ({
            id: `api-${index}`,
            query: suggestion,
            category: 'Suggested',
            icon: Search,
            description: 'AI-generated suggestion'
          }));
          setSuggestions(apiSuggestions);
        } else {
          setSuggestions(defaultSuggestions);
        }
      } catch (error) {
        console.error('Failed to load suggestions:', error);
        setSuggestions(defaultSuggestions);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, defaultSuggestions]);

  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion.query);
    }
  };

  const categories = [...new Set(suggestions.map(s => s.category))];

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-secondary-400" />
        <input
          type="text"
          placeholder="Search suggestions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm"
        />
        {loading && (
          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-primary-600 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Suggestions by category */}
      {categories.map(category => {
        const categorySuggestions = suggestions.filter(s => s.category === category);
        
        return (
          <div key={category} className="space-y-2">
            <h4 className="text-xs sm:text-sm font-medium text-secondary-700 flex items-center gap-2">
              {category}
              <span className="text-xs text-secondary-500">
                ({categorySuggestions.length})
              </span>
            </h4>
            
            <div className="grid gap-1.5 sm:gap-2">
              {categorySuggestions.map(suggestion => {
                const Icon = suggestion.icon;
                
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-2 sm:p-3 rounded-lg border border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-secondary-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-600 group-hover:text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-secondary-900 group-hover:text-primary-900 leading-tight">
                          {suggestion.query}
                        </p>
                        <p className="text-xs text-secondary-500 mt-1 leading-tight">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* No suggestions message */}
      {suggestions.length === 0 && !loading && (
        <div className="text-center py-8 text-secondary-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
          <p className="text-sm">No suggestions found</p>
          <p className="text-xs">Try a different search term</p>
        </div>
      )}

      {/* Recent queries (if available) */}
      {searchQuery.trim().length === 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Quick Examples
          </h4>
          
          <div className="grid gap-1">
            {defaultSuggestions.slice(0, 4).map(suggestion => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-2 rounded-md hover:bg-secondary-50 transition-colors text-sm text-secondary-700 hover:text-primary-700"
              >
                {suggestion.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuerySuggestions;
