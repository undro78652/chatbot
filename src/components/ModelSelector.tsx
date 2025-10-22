import { X, Cpu } from 'lucide-react';
import { AIModel } from '../types';

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  models: AIModel[];
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelector = ({
  isOpen,
  onClose,
  models,
  selectedModelId,
  onSelectModel,
}: ModelSelectorProps) => {
  if (!isOpen) return null;

  const handleSelect = (modelId: string) => {
    onSelectModel(modelId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select AI Model</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                model.id === selectedModelId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{model.name}</h3>
                {model.id === selectedModelId && (
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{model.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Provider: {model.provider === 'openai' ? 'OpenAI' : 'OpenRouter'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
