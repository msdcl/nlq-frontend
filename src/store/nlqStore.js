/**
 * NLQ Store - Zustand store for managing NLQ application state
 * Handles query history, settings, and UI state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNLQStore = create(
  persist(
    (set, get) => ({
      // Query history
      queryHistory: [],
      
      // Current query state
      currentQuery: '',
      isProcessing: false,
      currentLanguage: 'en',
      
      // Query results
      currentResult: null,
      queryError: null,
      
      // UI state
      theme: 'light',
      fontSize: 'medium',
      currentView: 'dashboard', // dashboard, chat
      
      // Settings
      settings: {
        autoExecute: true,
        showExplanation: true,
        maxResults: 1000,
        enableSuggestions: true,
        enableCharts: true,
        chartType: 'table', // table, bar, line, pie
      },
      
      // Schema information
      schema: null,
      schemaLoading: false,
      
      // Service health
      serviceHealth: null,
      
      // Actions
      actions: {
        // Query actions
        setCurrentQuery: (query) => set({ currentQuery: query }),
        
        setProcessing: (isProcessing) => set({ isProcessing }),
        
        setLanguage: (language) => set({ currentLanguage: language }),
        
        addToHistory: (queryData) => {
          const { queryHistory } = get();
          const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...queryData
          };
          set({ 
            queryHistory: [newEntry, ...queryHistory].slice(0, 100) // Keep last 100 queries
          });
        },
        
        clearHistory: () => set({ queryHistory: [] }),
        
        removeFromHistory: (id) => {
          const { queryHistory } = get();
          set({ 
            queryHistory: queryHistory.filter(entry => entry.id !== id)
          });
        },
        
        // Result actions
        setCurrentResult: (result) => set({ currentResult: result, queryError: null }),
        
        setQueryError: (error) => set({ queryError: error, currentResult: null }),
        
        clearResult: () => set({ currentResult: null, queryError: null }),
        
        // UI actions
        
        setTheme: (theme) => set({ theme }),
        
        setFontSize: (fontSize) => set({ fontSize }),
        
        setCurrentView: (view) => set({ currentView: view }),
        
        // Settings actions
        updateSettings: (newSettings) => {
          const { settings } = get();
          set({ 
            settings: { ...settings, ...newSettings }
          });
        },
        
        resetSettings: () => set({ 
          settings: {
            autoExecute: true,
            showExplanation: true,
            maxResults: 1000,
            enableSuggestions: true,
            enableCharts: true,
            chartType: 'table',
          }
        }),
        
        // Schema actions
        setSchema: (schema) => set({ schema }),
        
        setSchemaLoading: (loading) => set({ schemaLoading: loading }),
        
        // Health actions
        setServiceHealth: (health) => set({ serviceHealth: health }),
        
        // Utility actions
        exportHistory: () => {
          const { queryHistory } = get();
          const dataStr = JSON.stringify(queryHistory, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `nlq-history-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
        },
        
        importHistory: (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                  set({ queryHistory: data });
                  resolve(data);
                } else {
                  reject(new Error('Invalid file format'));
                }
              } catch (error) {
                reject(new Error('Failed to parse file'));
              }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          });
        },
        
        // Reset all state
        reset: () => set({
          queryHistory: [],
          currentQuery: '',
          isProcessing: false,
          currentLanguage: 'en',
          currentResult: null,
          queryError: null,
          theme: 'light',
          fontSize: 'medium',
          currentView: 'dashboard',
          settings: {
            autoExecute: true,
            showExplanation: true,
            maxResults: 1000,
            enableSuggestions: true,
            enableCharts: true,
            chartType: 'table',
          },
          schema: null,
          schemaLoading: false,
          serviceHealth: null,
        })
      }
    }),
    {
      name: 'nlq-store',
      partialize: (state) => ({
        queryHistory: state.queryHistory,
        currentLanguage: state.currentLanguage,
        theme: state.theme,
        fontSize: state.fontSize,
        settings: state.settings,
      }),
    }
  )
);

// Selectors for better performance
export const useQueryHistory = () => useNLQStore((state) => state.queryHistory);
export const useCurrentQuery = () => useNLQStore((state) => state.currentQuery);
export const useIsProcessing = () => useNLQStore((state) => state.isProcessing);
export const useCurrentLanguage = () => useNLQStore((state) => state.currentLanguage);
export const useCurrentResult = () => useNLQStore((state) => state.currentResult);
export const useQueryError = () => useNLQStore((state) => state.queryError);
export const useTheme = () => useNLQStore((state) => state.theme);
export const useFontSize = () => useNLQStore((state) => state.fontSize);
export const useSettings = () => useNLQStore((state) => state.settings);
export const useSchema = () => useNLQStore((state) => state.schema);
export const useSchemaLoading = () => useNLQStore((state) => state.schemaLoading);
export const useServiceHealth = () => useNLQStore((state) => state.serviceHealth);

export const useNLQActions = () => useNLQStore((state) => state.actions);

export default useNLQStore;
