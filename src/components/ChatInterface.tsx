import { useState, useRef, useEffect, memo, useMemo } from 'react';
import { Send, Loader2, Settings as SettingsIcon, Edit2, RotateCcw, Trash2, Menu, Upload, X, Copy, Check, Download, Sliders } from 'lucide-react';
import { Message, Character, AIModel } from '../types';
import { MarkdownMessage } from './MarkdownMessage';
import { estimateMessagesTokenCount, getTokenColorClass } from '../utils/tokenCounter';

interface ChatInterfaceProps {
  messages: Message[];
  character: Character | undefined;
  selectedModel: AIModel;
  models: AIModel[];
  isLoading: boolean;
  hasApiKey: boolean;
  renderMarkdown: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  fontSize: string;
  onSendMessage: (content: string) => void;
  onSelectModel: (modelId: string) => void;
  onOpenSettings: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onResendMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onToggleSidebar: () => void;
  onImportMessages: (messages: { role: string; content: string }[]) => void;
  onExportConversation: () => void;
  onOpenConversationSettings: () => void;
}

export const ChatInterface = memo(({
  messages,
  character,
  selectedModel,
  models,
  isLoading,
  hasApiKey,
  renderMarkdown,
  autoScroll,
  showTimestamps,
  fontSize,
  onSendMessage,
  onSelectModel,
  onOpenSettings,
  onEditMessage,
  onResendMessage,
  onDeleteMessage,
  onToggleSidebar,
  onImportMessages,
  onExportConversation,
  onOpenConversationSettings,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = send message
    // Shift+Enter = newline (natural textarea behavior)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImportSubmit = () => {
    setImportError('');
    try {
      const parsed = JSON.parse(importJson);
      
      if (!Array.isArray(parsed)) {
        setImportError('JSON must be an array of messages');
        return;
      }

      const validatedMessages = parsed.map((msg, index) => {
        if (!msg.role || !msg.content) {
          throw new Error(`Message at index ${index} missing role or content`);
        }
        if (!['user', 'assistant', 'system'].includes(msg.role)) {
          throw new Error(`Message at index ${index} has invalid role: ${msg.role}`);
        }
        return { role: msg.role, content: msg.content };
      });

      onImportMessages(validatedMessages);
      setImportJson('');
      setIsImportModalOpen(false);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Calculate token count for current conversation
  const tokenCount = useMemo(() => {
    return estimateMessagesTokenCount(messages.map(m => ({ role: m.role, content: m.content })));
  }, [messages]);

  if (!character) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Select or create a character to start chatting</p>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-6">
          <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">API Key Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please add your API key in settings to start chatting with AI models.
          </p>
          <button
            onClick={onOpenSettings}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: character.avatarColor }}
            >
              {character.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {character.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {character.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedModel.id}
              onChange={(e) => onSelectModel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                  {model.provider !== 'custom' && ` (${model.provider.charAt(0).toUpperCase() + model.provider.slice(1)})`}
                </option>
              ))}
            </select>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              selectedModel.provider === 'openai' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              selectedModel.provider === 'openrouter' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
              selectedModel.provider === 'anthropic' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {selectedModel.provider.toUpperCase()}
            </span>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Import messages"
              title="Import messages from JSON"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={onExportConversation}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Export conversation"
              title="Export this conversation"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenConversationSettings}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Conversation settings"
              title="Adjust temperature and system prompt"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold mx-auto mb-4"
                style={{ backgroundColor: character.avatarColor }}
              >
                {character.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Send a message to begin chatting with {character.name}
              </p>
            </div>
          </div>
        ) : (
          messages
            .filter((msg) => msg.role !== 'system')
            .map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: character.avatarColor }}
                  >
                    {character.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg group ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onEditMessage(message.id, editContent);
                            setEditingMessageId(null);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <MarkdownMessage
                        message={message}
                        renderMarkdown={renderMarkdown}
                        isUser={message.role === 'user'}
                      />
                      <div className="flex items-center justify-between mt-2">
                        {showTimestamps && (
                          <p
                            className={`text-xs ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                        {message.role === 'user' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              className="p-1 text-blue-100 hover:text-white"
                              aria-label="Copy message"
                            >
                              {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessageId(message.id);
                                setEditContent(message.content);
                              }}
                              className="p-1 text-blue-100 hover:text-white"
                              aria-label="Edit message"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onResendMessage(message.id)}
                              className="p-1 text-blue-100 hover:text-white"
                              aria-label="Resend message"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this message and its response?')) {
                                  onDeleteMessage(message.id);
                                }
                              }}
                              className="p-1 text-blue-100 hover:text-red-300"
                              aria-label="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {message.role === 'assistant' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopyMessage(message.id, message.content)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                              aria-label="Copy response"
                            >
                              {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this response and the previous message?')) {
                                  onDeleteMessage(message.id);
                                }
                              }}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              aria-label="Delete response"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    U
                  </div>
                )}
              </div>
            ))
        )}

        {isLoading && (
          <div className="flex gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: character.avatarColor }}
            >
              {character.name.charAt(0).toUpperCase()}
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Token Counter */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className={`text-xs font-medium ${getTokenColorClass(tokenCount)}`}>
            <span className="mr-1">📊</span>
            {tokenCount.toLocaleString()} tokens
            {tokenCount > 8000 && <span className="ml-2 text-orange-600 dark:text-orange-400">(Approaching context limit)</span>}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {tokenCount < 2000 && '✅ Low usage'}
            {tokenCount >= 2000 && tokenCount < 6000 && '⚠️  Moderate usage'}
            {tokenCount >= 6000 && tokenCount < 12000 && '⚠️  High usage'}
            {tokenCount >= 12000 && '🚨 Very high usage'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${character.name}... (Shift+Enter for newline)`}
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-32 overflow-y-auto"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send
              </>
            )}
          </button>
        </form>
      </div>

      {/* Import Messages Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Messages</h2>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportJson('');
                  setImportError('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Paste a JSON array of messages. Each message should have <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">role</code> and <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">content</code> fields.
              </p>
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs font-mono overflow-x-auto">
                <pre>{`[\n  { "role": "user", "content": "Hello!" },\n  { "role": "assistant", "content": "Hi there!" }\n]`}</pre>
              </div>

              <textarea
                value={importJson}
                onChange={(e) => {
                  setImportJson(e.target.value);
                  setImportError('');
                }}
                placeholder='[{"role": "user", "content": "Hello!"}, ...]'
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {importError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportJson('');
                  setImportError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!importJson.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
