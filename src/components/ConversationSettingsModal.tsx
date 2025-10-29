import { useState, memo } from 'react';
import { X, Sliders } from 'lucide-react';
import { ConversationSettings } from '../types';

interface ConversationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ConversationSettings) => void;
  currentSettings: ConversationSettings;
  characterSystemPrompt: string;
}

export const ConversationSettingsModal = memo(({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  characterSystemPrompt,
}: ConversationSettingsModalProps) => {
  const [temperature, setTemperature] = useState(currentSettings.temperature ?? 0.7);
  const [systemPromptOverride, setSystemPromptOverride] = useState(currentSettings.systemPromptOverride ?? '');
  const [maxTokens, setMaxTokens] = useState(currentSettings.maxTokens ?? 2048);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      temperature,
      systemPromptOverride: systemPromptOverride.trim() || undefined,
      maxTokens,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversation Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Temperature: {temperature.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>More focused (0.0)</span>
              <span>More creative (2.0)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Lower values make output more deterministic. Higher values make it more creative and random.
            </p>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Max Tokens: {maxTokens}
            </label>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>256</span>
              <span>4096</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Maximum number of tokens to generate in responses.
            </p>
          </div>

          {/* System Prompt Override */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              System Prompt Override (Optional)
            </label>
            <textarea
              value={systemPromptOverride}
              onChange={(e) => setSystemPromptOverride(e.target.value)}
              placeholder="Leave empty to use character's default prompt..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <details className="mt-2">
              <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                View character's default prompt
              </summary>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-700 dark:text-gray-300">
                {characterSystemPrompt}
              </div>
            </details>
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
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
});

