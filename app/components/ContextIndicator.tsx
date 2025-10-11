import React from 'react';
import { getContextInfo, type ModelType } from '@/app/lib/contextWindow';
import type { Message } from '@/app/lib/hooks/useChat';

interface ContextIndicatorProps {
  messages: Message[];
  modelType?: ModelType;
  className?: string;
}

export function ContextIndicator({ messages, modelType = 'gemini-2.5-flash', className = '' }: ContextIndicatorProps) {
  const contextInfo = getContextInfo(messages, modelType);
  
  if (messages.length === 0) return null;

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 60) return 'text-green-600 bg-green-50';
    if (utilization < 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getUtilizationBorderColor = (utilization: number) => {
    if (utilization < 60) return 'border-green-200';
    if (utilization < 80) return 'border-yellow-200';
    return 'border-red-200';
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${getUtilizationColor(contextInfo.utilization)} ${getUtilizationBorderColor(contextInfo.utilization)}`}>
        <svg 
          className="w-3 h-3" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-medium">
          {contextInfo.utilization.toFixed(0)}%
        </span>
        <span className="opacity-75">
          ({contextInfo.totalTokens.toLocaleString()}/{contextInfo.maxTokens.toLocaleString()})
        </span>
      </div>
      
      {contextInfo.needsTrimming && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
          <svg 
            className="w-3 h-3" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Auto-trim</span>
        </div>
      )}
      
      <div className="text-gray-500 opacity-75">
        {messages.length} {messages.length === 1 ? 'message' : 'messages'}
      </div>
    </div>
  );
}

interface ContextTooltipProps {
  messages: Message[];
  modelType?: ModelType;
  children: React.ReactNode;
}

export function ContextTooltip({ messages, modelType = 'gemini-2.5-flash', children }: ContextTooltipProps) {
  const contextInfo = getContextInfo(messages, modelType);
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="space-y-2">
          <div className="font-semibold text-white">Context Window Status</div>
          
          <div className="grid grid-cols-2 gap-2 text-gray-300">
            <div>
              <div className="font-medium">Model:</div>
              <div>{modelType}</div>
            </div>
            <div>
              <div className="font-medium">Utilization:</div>
              <div>{contextInfo.utilization.toFixed(1)}%</div>
            </div>
            <div>
              <div className="font-medium">Tokens Used:</div>
              <div>{contextInfo.totalTokens.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium">Max Tokens:</div>
              <div>{contextInfo.maxTokens.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium">Remaining:</div>
              <div>{contextInfo.remainingTokens.toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium">Messages:</div>
              <div>{messages.length}</div>
            </div>
          </div>
          
          {contextInfo.needsTrimming && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-amber-400 font-medium">⚠ Auto-trimming enabled</div>
              <div className="text-gray-400 text-xs mt-1">
                Older messages will be summarized to fit context window
              </div>
            </div>
          )}
          
          {contextInfo.utilization > 90 && (
            <div className="pt-2 border-t border-gray-700">
              <div className="text-red-400 font-medium">⚠ Context limit approaching</div>
              <div className="text-gray-400 text-xs mt-1">
                Consider starting a new chat for best performance
              </div>
            </div>
          )}
        </div>
        
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}
