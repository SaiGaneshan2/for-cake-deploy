import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Zap, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { GROQ_CONFIG, SYSTEM_PROMPT } from '../config/groq';
import { getQuickActionsForLevel, getAllQuickActions } from '../config/quickActions';
import { validateSQLSyntax, getOptimizationTips, formatSQL, getKeywordSuggestions } from '../utils/sqlValidator';
import { useSelector } from 'react-redux';

const SQLChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your **SQL assistant**. I can help you with:\n\n• **SQL queries** and syntax\n• **Database concepts** and operations\n• **Game level guidance** (without spoilers!)\n• **Best practices** and examples\n\nWhat would you like to know about SQL?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [sqlValidation, setSqlValidation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Get current level from Redux store
  const gameState = useSelector((state) => state.game);
  const currentLevel = gameState?.currentLevel || 1;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_CONFIG.MODEL,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userMessage.content
            }
          ],
          max_tokens: GROQ_CONFIG.MAX_TOKENS,
          temperature: GROQ_CONFIG.TEMPERATURE,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment. If the problem persists, check your internet connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle input change with SQL validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // SQL validation for queries
    if (value.trim().toUpperCase().startsWith('SELECT') || 
        value.trim().toUpperCase().startsWith('INSERT') ||
        value.trim().toUpperCase().startsWith('UPDATE') ||
        value.trim().toUpperCase().startsWith('DELETE')) {
      const validation = validateSQLSyntax(value);
      setSqlValidation(validation);
    } else {
      setSqlValidation(null);
    }

    // Keyword suggestions
    const words = value.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord && lastWord.length > 2) {
      const suggestions = getKeywordSuggestions(lastWord);
      setKeywordSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
      setKeywordSuggestions([]);
    }
  };

  // Handle quick action click
  const handleQuickAction = (action) => {
    setInputMessage(action.query);
    setShowQuickActions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get quick actions for current level
  const getQuickActions = () => {
    return getQuickActionsForLevel(currentLevel);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
          aria-label="Open SQL Assistant"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-container fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">SQL Assistant</h3>
                <p className="text-xs text-blue-100">Level {currentLevel} • Ask me anything about SQL!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Quick actions"
                title="Quick Actions"
              >
                <Zap size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          {showQuickActions && (
            <div className="bg-gray-700 border-b border-gray-600 p-3 max-h-32 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white">Quick Actions</h4>
                <span className="text-xs text-gray-400">Level {currentLevel}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {getQuickActions().slice(0, 6).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-full transition-colors flex items-center space-x-1"
                    title={action.query}
                  >
                    <span>{action.icon}</span>
                    <span className="truncate max-w-20">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SQL Validation Display */}
          {sqlValidation && (
            <div className="bg-gray-700 border-b border-gray-600 p-3">
              <div className="flex items-center space-x-2 mb-2">
                {sqlValidation.isValid ? (
                  <CheckCircle size={16} className="text-green-400" />
                ) : (
                  <AlertTriangle size={16} className="text-red-400" />
                )}
                <span className="text-xs font-bold text-white">
                  {sqlValidation.isValid ? 'SQL Valid' : 'SQL Errors Found'}
                </span>
              </div>
              
              {sqlValidation.errors.length > 0 && (
                <div className="mb-2">
                  {sqlValidation.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-300 mb-1">
                      • {error}
                    </div>
                  ))}
                </div>
              )}
              
              {sqlValidation.warnings.length > 0 && (
                <div className="mb-2">
                  {sqlValidation.warnings.map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-300 mb-1">
                      ⚠ {warning}
                    </div>
                  ))}
                </div>
              )}
              
              {sqlValidation.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    <Lightbulb size={12} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-300">Suggestions:</span>
                  </div>
                  {sqlValidation.suggestions.map((suggestion, index) => (
                    <div key={index} className="text-xs text-blue-200 mb-1">
                      💡 {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-700 text-white border border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && (
                      <Bot size={16} className="mt-1 text-blue-400 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User size={16} className="mt-1 text-white flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-300 font-bold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="text-blue-300">$1</em>')
                          .replace(/`(.*?)`/g, '<code class="bg-gray-600 text-green-300 px-1 rounded text-xs">$1</code>')
                          .replace(/\n/g, '<br/>')
                      }}></p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white border border-gray-600 rounded-2xl px-4 py-2 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-blue-400" />
                    <div className="flex items-center space-x-1">
                      <Loader2 size={16} className="animate-spin text-blue-400" />
                      <span className="text-sm text-gray-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="relative">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about SQL concepts, queries, or game help..."
                  className="flex-1 px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-400 disabled:to-gray-400 text-white p-2 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
              
              {/* Keyword Suggestions */}
              {showSuggestions && keywordSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="text-xs text-gray-400 mb-1">Suggestions:</div>
                    <div className="flex flex-wrap gap-1">
                      {keywordSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const words = inputMessage.split(' ');
                            words[words.length - 1] = suggestion;
                            setInputMessage(words.join(' ') + ' ');
                            setShowSuggestions(false);
                            if (inputRef.current) inputRef.current.focus();
                          }}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                💡 Try asking: "How do I use WHERE clause?" or "Explain JOINs"
              </p>
              {sqlValidation && (
                <div className="flex items-center space-x-1">
                  {sqlValidation.isValid ? (
                    <CheckCircle size={12} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={12} className="text-red-400" />
                  )}
                  <span className="text-xs text-gray-400">
                    {sqlValidation.isValid ? 'Valid SQL' : 'Check syntax'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .chat-window {
          backdrop-filter: blur(10px);
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .chat-window {
          animation: slideIn 0.3s ease-out;
        }
        
        /* Custom scrollbar for dark theme */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Fix any overlay issues */
        .chat-messages {
          position: relative;
          z-index: 1;
        }
        
        /* Ensure proper overflow handling */
        .chat-container {
          overflow: hidden;
        }
        
        /* Remove any potential overlay elements */
        .chat-messages::before,
        .chat-messages::after {
          display: none !important;
        }
        
        /* Ensure clean rendering */
        .chat-container * {
          box-sizing: border-box;
        }
        
        /* Fix any potential pseudo-element overlays */
        .chat-messages *::before,
        .chat-messages *::after {
          content: none !important;
        }
        
        /* Ensure proper text rendering */
        .chat-messages p {
          margin: 0;
          padding: 0;
          line-height: 1.4;
        }
        
        /* Fix any potential background overlays */
        .chat-messages {
          background: #1f2937 !important;
          position: relative;
        }
        
        /* Override any global styles that might cause issues */
        .chat-container {
          isolation: isolate;
        }
        
        .chat-messages {
          isolation: isolate;
          contain: layout style;
        }
        
        /* Ensure no unwanted overlays */
        .chat-container::before,
        .chat-container::after {
          display: none !important;
        }
        
        /* Fix any potential z-index issues */
        .chat-messages > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default SQLChatbot;
