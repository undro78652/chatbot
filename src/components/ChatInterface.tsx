import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Settings as SettingsIcon, Edit2, RotateCcw, Search } from 'lucide-react';
import { Message, Character, AIModel } from '../types';
import { MarkdownMessage } from './MarkdownMessage';

interface ChatInterfaceProps {
  messages: Message[];
  character: Character | undefined;
  selectedModel: AIModel;
  models: AIModel[];
  isLoading: boolean;
  hasApiKey: boolean;
  renderMarkdown: boolean;
  autoScroll: boolean;
  fontSize: string;
  onSendMessage: (content: string) => void;
  onSelectModel: (modelId: string) => void;
  onOpenSettings: () => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onResendMessage: (messageId: string) => void;
}

export const ChatInterface = ({
  messages,
  character,
  selectedModel,
  models,
  isLoading,
  hasApiKey,
  renderMarkdown,
  autoScroll,
  fontSize,
  onSendMessage,
  onSelectModel,
  onOpenSettings,
  onEditMessage,
  onResendMessage,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
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
        {searchQuery && (
          <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-gray-900 dark:text-white">
              Searching: <span className="font-medium">{searchQuery}</span>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchQuery(searchQuery ? '' : ' ')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Search messages"
            >
              <Search className="w-5 h-5" />
            </button>
            <select
              value={selectedModel.id}
              onChange={(e) => onSelectModel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
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
                        <p
                          className={`text-xs ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                        {message.role === 'user' && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${character.name}...`}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};
