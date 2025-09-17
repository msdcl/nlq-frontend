/**
 * ChatInterface - Main chat component for NLQ interactions
 * Provides a conversational interface for natural language queries
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Copy, Check, AlertCircle } from 'lucide-react';
import useNLQStore, { useNLQActions } from '../store/nlqStore';
import { nlqAPI, errorHandler } from '../services/api';
import QuerySuggestions from './QuerySuggestions';
import QueryResult from './QueryResult';
// import SQLViewer from './SQLViewer';
import toast from 'react-hot-toast';

const ChatInterface = () => {
  const [inputValue, setInputValue] = useState('');
  // const [isTyping, setIsTyping] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    queryHistory,
    currentResult,
    queryError,
    isProcessing,
    currentLanguage,
    settings
  } = useNLQStore();
  
  const {
    setCurrentQuery,
    setProcessing,
    addToHistory,
    setCurrentResult,
    setQueryError,
    clearResult
  } = useNLQActions();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryHistory, currentResult, queryError]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isProcessing) return;

    const query = inputValue.trim();
    setInputValue('');
    setCurrentQuery(query);
    setProcessing(true);
    clearResult();

    try {
      // Add user message to history
      addToHistory({
        type: 'user',
        query,
        language: currentLanguage,
        timestamp: new Date().toISOString()
      });

      // Process query
      const result = await nlqAPI.processQuery(query, {
        language: currentLanguage,
        ...settings
      });

      if (result.success) {
        setCurrentResult(result);
        
        // Add bot response to history
        addToHistory({
          type: 'bot',
          query,
          result,
          timestamp: new Date().toISOString()
        });
        
        toast.success('Query processed successfully');
      } else {
        throw new Error(result.error || 'Query processing failed');
      }
    } catch (error) {
      const errorMessage = errorHandler.getErrorMessage(error);
      setQueryError(errorMessage);
      
      // Add error to history
      addToHistory({
        type: 'error',
        query,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyQuery = async (query) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedQuery(query);
      setTimeout(() => setCopiedQuery(null), 2000);
      toast.success('Query copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy query');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const renderMessage = (entry, index) => {
    const isUser = entry.type === 'user';
    const isError = entry.type === 'error';
    
    return (
      <div
        key={entry.id || index}
        className={`flex gap-2 sm:gap-3 p-3 sm:p-4 ${
          isUser ? 'bg-primary-50' : isError ? 'bg-error-50' : 'bg-white'
        }`}
      >
        <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-600' : isError ? 'bg-error-600' : 'bg-secondary-600'
        }`}>
          {isUser ? (
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          ) : isError ? (
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          ) : (
            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-secondary-900">
              {isUser ? 'You' : isError ? 'Error' : 'Assistant'}
            </span>
            <span className="text-xs text-secondary-500">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            {entry.query && (
              <button
                onClick={() => handleCopyQuery(entry.query)}
                className="p-1 hover:bg-secondary-100 rounded transition-colors"
                title="Copy query"
              >
                {copiedQuery === entry.query ? (
                  <Check className="w-3 h-3 text-success-600" />
                ) : (
                  <Copy className="w-3 h-3 text-secondary-500" />
                )}
              </button>
            )}
          </div>
          
          <div className="prose prose-sm max-w-none">
            {isError ? (
              <div className="text-error-700 bg-error-100 p-3 rounded-lg">
                {entry.error}
              </div>
            ) : isUser ? (
              <div className="text-secondary-700">
                {entry.query}
              </div>
            ) : (
              <div className="text-secondary-700">
                <div className="mb-2">
                  <strong>Query:</strong> {entry.query}
                </div>
                {entry.result && (
                  <div className="mt-3">
                    <QueryResult result={entry.result} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-white/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              E-commerce Analytics Chat
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Ask questions about your sales, customers, and products in plain English
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Ready</span>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => {
                // Language change would be handled by parent component
                console.log('Language changed to:', e.target.value);
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white/80 backdrop-blur-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scrollbar">
        {queryHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 sm:p-8">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
              <Bot className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Welcome to E-commerce Analytics
            </h3>
            <p className="text-gray-600 mb-8 max-w-lg text-base">
              Ask questions about your sales, customers, products, and marketing performance. 
              Get instant insights with beautiful visualizations!
            </p>
            <QuerySuggestions onSuggestionClick={handleSuggestionClick} />
          </div>
        ) : (
          <div className="space-y-0">
            {queryHistory.map((entry, index) => renderMessage(entry, index))}
            
            {/* Current processing state */}
            {isProcessing && (
              <div className="flex gap-3 p-4 bg-blue-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-secondary-900">
                      Assistant
                    </span>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  </div>
                  <div className="text-secondary-700">
                    Processing your query...
                  </div>
                </div>
              </div>
            )}
            
            
            {/* Current error */}
            {queryError && (
              <div className="p-4 bg-error-50 border-t border-error-200">
                <div className="flex items-center gap-2 text-error-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Error:</span>
                  <span>{queryError}</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-secondary-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your data..."
              className="w-full resize-none border border-secondary-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                height: 'auto'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              disabled={isProcessing}
            />
            <div className="absolute right-2 top-2">
              <button
                type="submit"
                disabled={!inputValue.trim() || isProcessing}
                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Quick suggestions */}
        {settings.enableSuggestions && inputValue.length === 0 && (
          <div className="mt-2">
            <QuerySuggestions onSuggestionClick={handleSuggestionClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
