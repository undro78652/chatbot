import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CharacterModal } from './components/CharacterModal';
import { ModelSelector } from './components/ModelSelector';
import { SettingsPanel } from './components/SettingsPanel';
import { CustomModelModal } from './components/CustomModelModal';
import { Character, Conversation, Message, AIModel, AppSettings } from './types';
import {
  getSettings,
  saveSettings,
  getCharacters,
  saveCharacters,
  getConversations,
  saveConversations,
} from './utils/localStorage';
import { sendMessageToAI } from './utils/aiService';
import { handleExport, handleImport } from './utils/importExport';
import { downloadJson } from './utils/importExport';

const DEFAULT_AI_MODELS: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for most tasks',
    provider: 'openai',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model, best for complex tasks',
    provider: 'openai',
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: 'Enhanced GPT-4 with improved performance',
    provider: 'openai',
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo (OpenRouter)',
    description: 'Fast and efficient via OpenRouter',
    provider: 'openrouter',
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4 (OpenRouter)',
    description: 'Most capable via OpenRouter',
    provider: 'openrouter',
  },
];

function App() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [characters, setCharacters] = useState<Character[]>(getCharacters());
  const [conversations, setConversations] = useState<Conversation[]>(getConversations());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isCustomModelModalOpen, setIsCustomModelModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [editingModel, setEditingModel] = useState<AIModel | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const allModels = [...DEFAULT_AI_MODELS, ...(settings.customModels || [])];
  const currentCharacter = characters.find((c) => c.id === settings.selectedCharacterId);
  const currentConversation = conversations.find((c) => c.id === settings.currentConversationId);
  const selectedModel = allModels.find((m) => m.id === settings.selectedModelId) || allModels[0];

  useEffect(() => {
    if (!settings.selectedCharacterId && characters.length > 0) {
      handleSelectCharacter(characters[0].id);
    }
  }, [characters, settings.selectedCharacterId]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleSaveApiKey = (apiKey: string, provider: 'openai' | 'openrouter') => {
    const defaultModel = DEFAULT_AI_MODELS.find((m) => m.provider === provider);
    updateSettings({
      apiKey,
      selectedModelId: defaultModel?.id || settings.selectedModelId,
    });
  };

  const handleSelectCharacter = (characterId: string) => {
    const characterConversations = conversations.filter((c) => c.characterId === characterId);
    const latestConversation = characterConversations.sort((a, b) => b.updatedAt - a.updatedAt)[0];

    if (latestConversation) {
      updateSettings({
        selectedCharacterId: characterId,
        currentConversationId: latestConversation.id,
      });
    } else {
      createNewConversation(characterId);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    updateSettings({ currentConversationId: conversationId });
  };

  const createNewConversation = (characterId?: string) => {
    const charId = characterId || settings.selectedCharacterId;
    if (!charId) return;

    const newConversation: Conversation = {
      id: `conversation-${Date.now()}`,
      characterId: charId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const newConversations = [...conversations, newConversation];
    setConversations(newConversations);
    saveConversations(newConversations);
    updateSettings({
      selectedCharacterId: charId,
      currentConversationId: newConversation.id,
    });
  };

  const handleSaveCharacter = (character: Character) => {
    const existingIndex = characters.findIndex((c) => c.id === character.id);
    let newCharacters: Character[];

    if (existingIndex >= 0) {
      newCharacters = [...characters];
      newCharacters[existingIndex] = character;
    } else {
      newCharacters = [...characters, character];
    }

    setCharacters(newCharacters);
    saveCharacters(newCharacters);

    if (!settings.selectedCharacterId || existingIndex < 0) {
      handleSelectCharacter(character.id);
    }
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (characters.length <= 1) return;

    const newCharacters = characters.filter((c) => c.id !== characterId);
    const newConversations = conversations.filter((c) => c.characterId !== characterId);

    setCharacters(newCharacters);
    setConversations(newConversations);
    saveCharacters(newCharacters);
    saveConversations(newConversations);

    if (settings.selectedCharacterId === characterId) {
      handleSelectCharacter(newCharacters[0].id);
    }
  };

  const handleDeleteConversation = (conversationId: string) => {
    const newConversations = conversations.filter((c) => c.id !== conversationId);
    setConversations(newConversations);
    saveConversations(newConversations);

    if (settings.currentConversationId === conversationId) {
      const characterConversations = newConversations.filter(
        (c) => c.characterId === settings.selectedCharacterId
      );
      if (characterConversations.length > 0) {
        updateSettings({ currentConversationId: characterConversations[0].id });
      } else {
        createNewConversation();
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation || !currentCharacter || !settings.apiKey) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...currentConversation.messages, userMessage];
    updateConversation(currentConversation.id, updatedMessages);

    setIsLoading(true);

    const systemMessage: Message = {
      id: `sys-${Date.now()}`,
      role: 'system',
      content: currentCharacter.systemPrompt || 'You are a helpful assistant.',
      timestamp: Date.now(),
    };

    const messagesToSend = [systemMessage, ...updatedMessages];
    const response = await sendMessageToAI(
      messagesToSend,
      settings.apiKey,
      selectedModel.id,
      selectedModel.provider,
      selectedModel.endpoint
    );

    setIsLoading(false);

    if (response.error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${response.error}`,
        timestamp: Date.now(),
      };
      updateConversation(currentConversation.id, [...updatedMessages, errorMessage]);
    } else {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      };
      updateConversation(currentConversation.id, [...updatedMessages, assistantMessage]);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!currentConversation) return;

    const updatedMessages = currentConversation.messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );
    updateConversation(currentConversation.id, updatedMessages);
  };

  const handleResendMessage = async (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const message = currentConversation.messages[messageIndex];
    const messagesUpToResend = currentConversation.messages.slice(0, messageIndex);

    updateConversation(currentConversation.id, messagesUpToResend);

    await handleSendMessage(message.content);
  };

  const updateConversation = (conversationId: string, messages: Message[]) => {
    const newConversations = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, messages, updatedAt: Date.now() }
        : c
    );
    setConversations(newConversations);
    saveConversations(newConversations);
  };

  const handleExportData = () => {
    handleExport();
  };

  const handleExportCharacter = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    if (!character) return;

    const characterConversations = conversations.filter((c) => c.characterId === characterId);
    const exportData = {
      version: '1.0',
      exportDate: Date.now(),
      character,
      conversations: characterConversations,
    };

    const timestamp = new Date().toISOString().split('T')[0];
    downloadJson(exportData, `${character.name.toLowerCase().replace(/\s+/g, '-')}-export-${timestamp}.json`);
  };

  const handleImportData = async () => {
    try {
      await handleImport();
      setSettings(getSettings());
      setCharacters(getCharacters());
      setConversations(getConversations());
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleOpenCharacterModal = (character?: Character) => {
    setEditingCharacter(character);
    setIsCharacterModalOpen(true);
  };

  const handleSaveCustomModel = (model: AIModel) => {
    const existingIndex = settings.customModels.findIndex((m) => m.id === model.id);
    let newCustomModels: AIModel[];

    if (existingIndex >= 0) {
      newCustomModels = [...settings.customModels];
      newCustomModels[existingIndex] = model;
    } else {
      newCustomModels = [...settings.customModels, model];
    }

    updateSettings({ customModels: newCustomModels });
  };

  const handleDeleteCustomModel = (modelId: string) => {
    const newCustomModels = settings.customModels.filter((m) => m.id !== modelId);
    updateSettings({ customModels: newCustomModels });

    if (settings.selectedModelId === modelId) {
      updateSettings({ selectedModelId: DEFAULT_AI_MODELS[0].id });
    }
  };

  const handleOpenCustomModelModal = (model?: AIModel) => {
    setEditingModel(model);
    setIsCustomModelModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        characters={characters}
        conversations={conversations}
        selectedCharacterId={settings.selectedCharacterId}
        currentConversationId={settings.currentConversationId}
        darkMode={settings.darkMode}
        onSelectCharacter={handleSelectCharacter}
        onSelectConversation={handleSelectConversation}
        onNewConversation={() => createNewConversation()}
        onNewCharacter={() => handleOpenCharacterModal()}
        onEditCharacter={handleOpenCharacterModal}
        onDeleteCharacter={handleDeleteCharacter}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsPanelOpen(true)}
        onExport={handleExportData}
        onImport={handleImportData}
        onToggleDarkMode={() => updateSettings({ darkMode: !settings.darkMode })}
      />

      <ChatInterface
        messages={currentConversation?.messages || []}
        character={currentCharacter}
        selectedModel={selectedModel}
        models={allModels}
        isLoading={isLoading}
        hasApiKey={!!settings.apiKey}
        renderMarkdown={settings.renderMarkdown}
        autoScroll={settings.autoScroll}
        fontSize={settings.fontSize}
        onSendMessage={handleSendMessage}
        onSelectModel={(modelId) => updateSettings({ selectedModelId: modelId })}
        onOpenSettings={() => setIsSettingsPanelOpen(true)}
        onEditMessage={handleEditMessage}
        onResendMessage={handleResendMessage}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={settings.apiKey}
      />

      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => {
          setIsCharacterModalOpen(false);
          setEditingCharacter(undefined);
        }}
        onSave={handleSaveCharacter}
        character={editingCharacter}
      />

      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        models={allModels}
        selectedModelId={settings.selectedModelId}
        onSelectModel={(modelId) => updateSettings({ selectedModelId: modelId })}
      />

      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenApiKeyModal={() => {
          setIsSettingsPanelOpen(false);
          setIsApiKeyModalOpen(true);
        }}
        onOpenCustomModelModal={handleOpenCustomModelModal}
        onDeleteCustomModel={handleDeleteCustomModel}
      />

      <CustomModelModal
        isOpen={isCustomModelModalOpen}
        onClose={() => {
          setIsCustomModelModalOpen(false);
          setEditingModel(undefined);
        }}
        onSave={handleSaveCustomModel}
        model={editingModel}
      />
    </div>
  );
}

export default App;
