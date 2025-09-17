/**
 * Header - Application header component
 * Displays navigation, settings, and service status
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Activity, Wifi, WifiOff, BarChart3, MessageSquare, ShoppingCart } from 'lucide-react';
import useNLQStore from '../store/nlqStore';

const Header = () => {
  const { serviceHealth } = useNLQStore();
  const location = useLocation();

  const isHealthy = serviceHealth?.healthy;

  return (
    <header className="glass-card sticky top-0 z-50 mx-4 mt-4 mb-0">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  E-commerce Analytics
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">Natural Language Query System</p>
              </div>
            </Link>
          </div>

          {/* Center - Navigation */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1 shadow-inner">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                location.pathname === '/dashboard'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </Link>
            <Link
              to="/askquestions"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                location.pathname === '/askquestions'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Questions</span>
              <span className="sm:hidden">Chat</span>
            </Link>
          </div>

          {/* Right side - Status and Actions */}
          <div className="flex items-center gap-4">
            {/* Service Status */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
              isHealthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {isHealthy ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${
                isHealthy ? 'text-green-700' : 'text-red-700'
              }`}>
                <span className="hidden sm:inline">{isHealthy ? 'Connected' : 'Disconnected'}</span>
                <span className="sm:hidden">{isHealthy ? 'On' : 'Off'}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                className="p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:shadow-md"
                title="Activity"
              >
                <Activity className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

// ÷' API API