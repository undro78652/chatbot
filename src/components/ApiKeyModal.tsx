import { useState, memo } from 'react';
import { X, Key, CheckCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKeys: { openai: string; openrouter: string; anthropic: string }) => void;
  currentApiKeys: { openai: string; openrouter: string; anthropic: string };
}

export const ApiKeyModal = memo(({ isOpen, onClose, onSave, currentApiKeys }: ApiKeyModalProps) => {
  const [apiKeys, setApiKeys] = useState(currentApiKeys);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(apiKeys);
    onClose();
  };

  const updateKey = (provider: 'openai' | 'openrouter' | 'anthropic', value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Key Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* OpenAI API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                OpenAI API Key
              </label>
              {apiKeys.openai && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Configured</span>
                </div>
              )}
            </div>
            <input
              type="password"
              value={apiKeys.openai}
              onChange={(e) => updateKey('openai', e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              Get your OpenAI API key →
            </a>
          </div>

          {/* OpenRouter API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                OpenRouter API Key
              </label>
              {apiKeys.openrouter && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Configured</span>
                </div>
              )}
            </div>
            <input
              type="password"
              value={apiKeys.openrouter}
              onChange={(e) => updateKey('openrouter', e.target.value)}
              placeholder="sk-or-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              Get your OpenRouter API key →
            </a>
          </div>

          {/* Anthropic API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Anthropic API Key
              </label>
              {apiKeys.anthropic && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Configured</span>
                </div>
              )}
            </div>
            <input
              type="password"
              value={apiKeys.anthropic}
              onChange={(e) => updateKey('anthropic', e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
            >
              Get your Anthropic API key →
            </a>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>🔒 Your API keys are stored locally in your browser and never sent to our servers.</p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save All Keys
          </button>
        </div>
      </div>
    </div>
  );
});
