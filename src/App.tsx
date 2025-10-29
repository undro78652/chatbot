import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CharacterModal } from './components/CharacterModal';
import { SettingsPanel } from './components/SettingsPanel';
import { CustomModelModal } from './components/CustomModelModal';
import { ConversationSettingsModal } from './components/ConversationSettingsModal';
import { Character, Conversation, Message, AIModel, AppSettings, ConversationSettings } from './types';
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
import { generateConversationTitle } from './utils/titleGenerator';

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
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Most intelligent Claude model',
    provider: 'anthropic',
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Powerful model for complex tasks',
    provider: 'anthropic',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    description: 'Fastest and most compact Claude model',
    provider: 'anthropic',
  },
];

function App() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [characters, setCharacters] = useState<Character[]>(getCharacters());
  const [conversations, setConversations] = useState<Conversation[]>(getConversations());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isCustomModelModalOpen, setIsCustomModelModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [editingModel, setEditingModel] = useState<AIModel | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isConversationSettingsOpen, setIsConversationSettingsOpen] = useState(false);

  // Memoized computations - only recalculate when dependencies change
  const allModels = useMemo(
    () => [...DEFAULT_AI_MODELS, ...(settings.customModels || [])],
    [settings.customModels]
  );

  const currentCharacter = useMemo(
    () => characters.find((c) => c.id === settings.selectedCharacterId),
    [characters, settings.selectedCharacterId]
  );

  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === settings.currentConversationId),
    [conversations, settings.currentConversationId]
  );

  const selectedModel = useMemo(
    () => allModels.find((m) => m.id === settings.selectedModelId) || allModels[0],
    [allModels, settings.selectedModelId]
  );

  // Ref to avoid adding handleSelectCharacter to useEffect dependencies
  const handleSelectCharacterRef = useRef<(characterId: string) => void>(() => {});

  useEffect(() => {
    if (!settings.selectedCharacterId && characters.length > 0) {
      handleSelectCharacterRef.current(characters[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters.length, settings.selectedCharacterId]);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Memoized callbacks - prevent child component re-renders
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((current) => {
      const newSettings = { ...current, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const handleSaveApiKeys = useCallback((apiKeys: { openai: string; openrouter: string; anthropic: string }) => {
    updateSettings({ apiKeys });
  }, [updateSettings]);

  const createNewConversation = useCallback((characterId?: string) => {
    setSettings((currentSettings) => {
      setConversations((currentConversations) => {
        const charId = characterId || currentSettings.selectedCharacterId;
        if (!charId) return currentConversations;

        const newConversation: Conversation = {
          id: `conversation-${uuidv4()}`,
          characterId: charId,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const newConversations = [...currentConversations, newConversation];
        saveConversations(newConversations);

        // Update settings with new conversation
        const newSettings = {
          ...currentSettings,
          selectedCharacterId: charId,
          currentConversationId: newConversation.id,
        };
        saveSettings(newSettings);
        setSettings(newSettings);

        return newConversations;
      });
      return currentSettings;
    });
  }, []);

  const handleSelectCharacter = useCallback((characterId: string) => {
    setConversations((currentConversations) => {
      const characterConversations = currentConversations.filter((c) => c.characterId === characterId);
      const latestConversation = characterConversations.sort((a, b) => b.updatedAt - a.updatedAt)[0];

      if (latestConversation) {
        updateSettings({
          selectedCharacterId: characterId,
          currentConversationId: latestConversation.id,
        });
      } else {
        createNewConversation(characterId);
      }
      return currentConversations;
    });
  }, [updateSettings, createNewConversation]);

  // Update ref whenever handleSelectCharacter changes
  useEffect(() => {
    handleSelectCharacterRef.current = handleSelectCharacter;
  }, [handleSelectCharacter]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    updateSettings({ currentConversationId: conversationId });
  }, [updateSettings]);

  const handleSaveCharacter = useCallback((character: Character) => {
    setCharacters((current) => {
      const existingIndex = current.findIndex((c) => c.id === character.id);
      const newCharacters = existingIndex >= 0
        ? [...current.slice(0, existingIndex), character, ...current.slice(existingIndex + 1)]
        : [...current, character];
      
      saveCharacters(newCharacters);
      return newCharacters;
    });

    setSettings((currentSettings) => {
      if (!currentSettings.selectedCharacterId) {
        handleSelectCharacter(character.id);
      }
      return currentSettings;
    });
  }, [handleSelectCharacter]);

  const handleDeleteCharacter = useCallback((characterId: string) => {
    setCharacters((current) => {
      if (current.length <= 1) return current;

      const newCharacters = current.filter((c) => c.id !== characterId);
      saveCharacters(newCharacters);

      setConversations((currentConvs) => {
        const newConversations = currentConvs.filter((c) => c.characterId !== characterId);
        saveConversations(newConversations);
        return newConversations;
      });

      setSettings((currentSettings) => {
        if (currentSettings.selectedCharacterId === characterId) {
          handleSelectCharacter(newCharacters[0].id);
        }
        return currentSettings;
      });

      return newCharacters;
    });
  }, [handleSelectCharacter]);

  const handleDeleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => {
      const newConversations = current.filter((c) => c.id !== conversationId);
      saveConversations(newConversations);

      setSettings((currentSettings) => {
        if (currentSettings.currentConversationId === conversationId) {
          const characterConversations = newConversations.filter(
            (c) => c.characterId === currentSettings.selectedCharacterId
          );
          if (characterConversations.length > 0) {
            updateSettings({ currentConversationId: characterConversations[0].id });
          } else {
            createNewConversation();
          }
        }
        return currentSettings;
      });

      return newConversations;
    });
  }, [updateSettings, createNewConversation]);

  const updateConversation = useCallback((conversationId: string, messages: Message[], title?: string) => {
    setConversations((current) => {
      const newConversations = current.map((c) =>
        c.id === conversationId
          ? { ...c, messages, updatedAt: Date.now(), ...(title && { title }) }
          : c
      );
      saveConversations(newConversations);
      return newConversations;
    });
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentConversation || !currentCharacter) return;

    setSettings((currentSettings) => {
      // Get the correct API key based on the model's provider
      const providerKey = selectedModel.provider === 'openai' 
        ? currentSettings.apiKeys.openai
        : selectedModel.provider === 'openrouter'
        ? currentSettings.apiKeys.openrouter
        : selectedModel.provider === 'anthropic'
        ? currentSettings.apiKeys.anthropic
        : '';

      if (!providerKey) {
        alert(`Please configure an API key for ${selectedModel.provider} in settings.`);
        return currentSettings;
      }

      const userMessage: Message = {
        id: `msg-${uuidv4()}`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const updatedMessages = [...currentConversation.messages, userMessage];
      
      // Generate title if this is the first user message
      const isFirstMessage = currentConversation.messages.length === 0;
      const title = isFirstMessage ? generateConversationTitle(content) : undefined;
      
      updateConversation(currentConversation.id, updatedMessages, title);

      setIsLoading(true);

      // Use conversation settings if available
      const convSettings = currentConversation.settings || {};
      const systemPrompt = convSettings.systemPromptOverride || currentCharacter.systemPrompt || 'You are a helpful assistant.';
      
      const systemMessage: Message = {
        id: `sys-${uuidv4()}`,
        role: 'system',
        content: systemPrompt,
        timestamp: Date.now(),
      };

      const messagesToSend = [systemMessage, ...updatedMessages];
      
      sendMessageToAI(
        messagesToSend,
        providerKey,
        selectedModel.id,
        selectedModel.provider,
        selectedModel.endpoint,
        convSettings.temperature,
        convSettings.maxTokens
      ).then((response) => {
        setIsLoading(false);

        if (response.error) {
          const errorMessage: Message = {
            id: `msg-${uuidv4()}`,
            role: 'assistant',
            content: `Error: ${response.error}`,
            timestamp: Date.now(),
          };
          updateConversation(currentConversation.id, [...updatedMessages, errorMessage]);
        } else {
          const assistantMessage: Message = {
            id: `msg-${uuidv4()}`,
            role: 'assistant',
            content: response.content,
            timestamp: Date.now(),
          };
          updateConversation(currentConversation.id, [...updatedMessages, assistantMessage]);
        }
      });

      return currentSettings;
    });
  }, [currentConversation, currentCharacter, selectedModel, updateConversation]);

  const handleEditMessage = useCallback((messageId: string, newContent: string) => {
    if (!currentConversation) return;

    const updatedMessages = currentConversation.messages.map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );
    updateConversation(currentConversation.id, updatedMessages);
  }, [currentConversation, updateConversation]);

  const handleResendMessage = useCallback(async (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const message = currentConversation.messages[messageIndex];
    const messagesUpToResend = currentConversation.messages.slice(0, messageIndex);

    updateConversation(currentConversation.id, messagesUpToResend);

    await handleSendMessage(message.content);
  }, [currentConversation, updateConversation, handleSendMessage]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const message = currentConversation.messages[messageIndex];
    const idsToDelete: string[] = [messageId];

    // If deleting user message, also delete the next assistant message
    if (message.role === 'user' && messageIndex < currentConversation.messages.length - 1) {
      const nextMessage = currentConversation.messages[messageIndex + 1];
      if (nextMessage.role === 'assistant') {
        idsToDelete.push(nextMessage.id);
      }
    }

    // If deleting assistant message, also delete the previous user message
    if (message.role === 'assistant' && messageIndex > 0) {
      const prevMessage = currentConversation.messages[messageIndex - 1];
      if (prevMessage.role === 'user') {
        idsToDelete.push(prevMessage.id);
      }
    }

    // Filter out all messages to delete
    const updatedMessages = currentConversation.messages.filter(
      (msg) => !idsToDelete.includes(msg.id)
    );

    updateConversation(currentConversation.id, updatedMessages);
  }, [currentConversation, updateConversation]);

  const handleImportMessages = useCallback((importedMessages: { role: string; content: string }[]) => {
    if (!currentConversation) return;

    const newMessages: Message[] = importedMessages.map((msg) => ({
      id: `msg-${uuidv4()}`,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      timestamp: Date.now(),
    }));

    const updatedMessages = [...currentConversation.messages, ...newMessages];
    updateConversation(currentConversation.id, updatedMessages);
  }, [currentConversation, updateConversation]);

  const handleSaveConversationSettings = useCallback((conversationSettings: ConversationSettings) => {
    if (!currentConversation) return;

    setConversations((current) => {
      const newConversations = current.map((c) =>
        c.id === currentConversation.id
          ? { ...c, settings: conversationSettings }
          : c
      );
      saveConversations(newConversations);
      return newConversations;
    });
  }, [currentConversation]);

  const handleExportConversation = useCallback(() => {
    if (!currentConversation || !currentCharacter) return;

    const exportData = {
      character: currentCharacter.name,
      model: selectedModel.name,
      exportDate: new Date().toISOString(),
      messages: currentConversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${currentCharacter.name}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentConversation, currentCharacter, selectedModel]);

  const handleExportData = useCallback(() => {
    handleExport();
  }, []);

  const handleImportData = useCallback(async () => {
    try {
      await handleImport();
      setSettings(getSettings());
      setCharacters(getCharacters());
      setConversations(getConversations());
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    }
  }, []);

  const handleOpenCharacterModal = useCallback((character?: Character) => {
    setEditingCharacter(character);
    setIsCharacterModalOpen(true);
  }, []);

  const handleSaveCustomModel = useCallback((model: AIModel) => {
    setSettings((current) => {
      const existingIndex = current.customModels.findIndex((m) => m.id === model.id);
      const newCustomModels = existingIndex >= 0
        ? [...current.customModels.slice(0, existingIndex), model, ...current.customModels.slice(existingIndex + 1)]
        : [...current.customModels, model];

      const newSettings = { ...current, customModels: newCustomModels };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const handleDeleteCustomModel = useCallback((modelId: string) => {
    setSettings((current) => {
      const newCustomModels = current.customModels.filter((m) => m.id !== modelId);
      const newSettings = {
        ...current,
        customModels: newCustomModels,
        selectedModelId: current.selectedModelId === modelId ? DEFAULT_AI_MODELS[0].id : current.selectedModelId,
      };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const handleOpenCustomModelModal = useCallback((model?: AIModel) => {
    setEditingModel(model);
    setIsCustomModelModalOpen(true);
  }, []);

  const handleToggleDarkMode = useCallback(() => {
    updateSettings({ darkMode: !settings.darkMode });
  }, [updateSettings, settings.darkMode]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {isSidebarOpen && (
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
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}

      <ChatInterface
        messages={currentConversation?.messages || []}
        character={currentCharacter}
        selectedModel={selectedModel}
        models={allModels}
        isLoading={isLoading}
        hasApiKey={!!(settings.apiKeys.openai || settings.apiKeys.openrouter || settings.apiKeys.anthropic)}
        renderMarkdown={settings.renderMarkdown}
        autoScroll={settings.autoScroll}
        showTimestamps={settings.showTimestamps}
        fontSize={settings.fontSize}
        onSendMessage={handleSendMessage}
        onSelectModel={(modelId) => updateSettings({ selectedModelId: modelId })}
        onOpenSettings={() => setIsSettingsPanelOpen(true)}
        onEditMessage={handleEditMessage}
        onResendMessage={handleResendMessage}
        onDeleteMessage={handleDeleteMessage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onImportMessages={handleImportMessages}
        onExportConversation={handleExportConversation}
        onOpenConversationSettings={() => setIsConversationSettingsOpen(true)}
      />

      <ConversationSettingsModal
        isOpen={isConversationSettingsOpen}
        onClose={() => setIsConversationSettingsOpen(false)}
        onSave={handleSaveConversationSettings}
        currentSettings={currentConversation?.settings || {}}
        characterSystemPrompt={currentCharacter?.systemPrompt || ''}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKeys}
        currentApiKeys={settings.apiKeys}
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
