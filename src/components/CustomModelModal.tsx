import { useState, useEffect, memo } from 'react';
import { X, Plus } from 'lucide-react';
import { AIModel } from '../types';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: AIModel) => void;
  model?: AIModel;
}

export const CustomModelModal = memo(({ isOpen, onClose, onSave, model }: CustomModelModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modelId, setModelId] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [provider, setProvider] = useState<'openai' | 'openrouter' | 'anthropic' | 'custom'>('openai');
  const [error, setError] = useState('');

  useEffect(() => {
    if (model) {
      setName(model.name);
      setDescription(model.description);
      setModelId(model.id);
      setEndpoint(model.endpoint || '');
      setProvider(model.provider);
    } else {
      setName('');
      setDescription('');
      setModelId('');
      setEndpoint('');
      setProvider('openai');
    }
    setError('');
  }, [model, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Model name is required');
      return false;
    }
    if (!modelId.trim()) {
      setError('Model ID is required');
      return false;
    }
    if (provider === 'custom' && !endpoint.trim()) {
      setError('Custom API endpoint is required for custom provider');
      return false;
    }
    if (endpoint && !isValidUrl(endpoint)) {
      setError('Please enter a valid API endpoint URL');
      return false;
    }
    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const newModel: AIModel = {
      id: modelId.trim(),
      name: name.trim(),
      description: description.trim(),
      provider: provider,
      endpoint: provider === 'custom' ? endpoint.trim() : undefined,
      isCustom: true,
    };

    onSave(newModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {model ? 'Edit Custom Model' : 'Add Custom Model'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="model-provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider *
            </label>
            <select
              id="model-provider"
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as 'openai' | 'openrouter' | 'anthropic' | 'custom');
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai">OpenAI</option>
              <option value="openrouter">OpenRouter</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {provider === 'custom' 
                ? 'Custom provider requires a custom API endpoint'
                : `Will use your configured ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key`}
            </p>
          </div>

          <div>
            <label htmlFor="model-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model Name *
            </label>
            <input
              id="model-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Claude 3 Opus, Llama 3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="model-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model ID *
            </label>
            <input
              id="model-id"
              type="text"
              value={modelId}
              onChange={(e) => {
                setModelId(e.target.value);
                setError('');
              }}
              placeholder="e.g., claude-3-opus-20240229"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The exact model identifier to use in API calls
            </p>
          </div>

          <div>
            <label htmlFor="model-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              id="model-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of model capabilities"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {provider === 'custom' && (
            <div>
              <label htmlFor="model-endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom API Endpoint *
              </label>
              <input
                id="model-endpoint"
                type="url"
                value={endpoint}
                onChange={(e) => {
                  setEndpoint(e.target.value);
                  setError('');
                }}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the full API endpoint URL for your custom provider
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
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
            {model ? 'Update' : 'Add Model'}
          </button>
        </div>
      </div>
    </div>
  );
});
