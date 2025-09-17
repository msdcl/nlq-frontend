/**
 * SQLViewer - Component for displaying and editing SQL queries
 * Provides syntax highlighting and copy functionality
 */

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SQLViewer = ({ sql, editable = false, onSave, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSQL, setEditedSQL] = useState(sql);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedSQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('SQL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy SQL');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSQL(sql);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedSQL);
    }
    setIsEditing(false);
    toast.success('SQL updated');
  };

  const handleCancel = () => {
    setEditedSQL(sql);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-secondary-700">SQL Query</span>
          {editable && (
            <span className="text-xs text-secondary-500">
              {isEditing ? 'Editing' : 'Read-only'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {editable && !isEditing && (
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-secondary-100 rounded transition-colors"
              title="Edit SQL"
            >
              <Edit3 className="w-4 h-4 text-secondary-500" />
            </button>
          )}
          
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-secondary-100 rounded transition-colors"
            title="Copy SQL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success-600" />
            ) : (
              <Copy className="w-4 h-4 text-secondary-500" />
            )}
          </button>
        </div>
      </div>

      {/* SQL Content */}
      <div className="relative">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedSQL}
              onChange={(e) => setEditedSQL(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-32 p-3 text-sm font-mono border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Enter SQL query..."
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="btn btn-outline btn-sm"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary btn-sm"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <SyntaxHighlighter
              language="sql"
              style={tomorrow}
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
              wrapLines={true}
              wrapLongLines={true}
              showLineNumbers={true}
              lineNumberStyle={{
                color: '#94a3b8',
                marginRight: '1rem',
                userSelect: 'none',
              }}
            >
              {editedSQL}
            </SyntaxHighlighter>
            
            {/* Hover overlay for copy */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="p-2 bg-white/90 hover:bg-white border border-secondary-200 rounded-md shadow-sm transition-colors"
                title="Copy SQL"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success-600" />
                ) : (
                  <Copy className="w-4 h-4 text-secondary-500" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SQL Statistics */}
      <div className="mt-2 flex items-center gap-4 text-xs text-secondary-500">
        <span>Lines: {editedSQL.split('\n').length}</span>
        <span>Characters: {editedSQL.length}</span>
        <span>Words: {editedSQL.split(/\s+/).filter(word => word.length > 0).length}</span>
      </div>
    </div>
  );
};

export default SQLViewer;
