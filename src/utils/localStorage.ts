import { AppSettings, Character, Conversation, ExportData } from '../types';
import { debounce } from './debounce';

const STORAGE_KEYS = {
  SETTINGS: 'chatbot_settings',
  CHARACTERS: 'chatbot_characters',
  CONVERSATIONS: 'chatbot_conversations',
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: {
    openai: '',
    openrouter: '',
    anthropic: '',
  },
  selectedModelId: 'gpt-3.5-turbo',
  selectedCharacterId: '',
  currentConversationId: '',
  darkMode: false,
  fontSize: 'medium',
  renderMarkdown: true,
  autoScroll: true,
  showTimestamps: true,
  customModels: [],
  autoSummarizeThreshold: 6000,
  keepRecentMessages: 25,
  showSummarizeNotifications: true,
};

const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'default-assistant',
    name: 'AI Assistant',
    description: 'A helpful and knowledgeable AI assistant',
    systemPrompt: 'You are a helpful, friendly, and knowledgeable AI assistant. Provide clear and concise responses.',
    avatarColor: '#3b82f6',
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'A creative storyteller and wordsmith',
    systemPrompt: 'You are a creative writer with a flair for storytelling. Use vivid imagery and engaging narratives.',
    avatarColor: '#8b5cf6',
  },
  {
    id: 'code-expert',
    name: 'Code Expert',
    description: 'A programming expert and technical advisor',
    systemPrompt: 'You are a programming expert. Provide clear, well-documented code examples and technical explanations.',
    avatarColor: '#10b981',
  },
];

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    const parsed = JSON.parse(stored);
    
    // Migration: Convert old single apiKey to new apiKeys object
    if (parsed.apiKey && typeof parsed.apiKey === 'string') {
      parsed.apiKeys = {
        openai: parsed.apiKey,
        openrouter: '',
        anthropic: '',
      };
      delete parsed.apiKey;
    }
    
    return { ...DEFAULT_SETTINGS, ...parsed };
  }
  return DEFAULT_SETTINGS;
};

// Debounced save functions to reduce localStorage blocking
const debouncedSaveSettings = debounce((settings: AppSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}, 300);

export const saveSettings = (settings: AppSettings): void => {
  debouncedSaveSettings(settings);
};

export const getCharacters = (): Character[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initial save happens synchronously
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(DEFAULT_CHARACTERS));
  return DEFAULT_CHARACTERS;
};

const debouncedSaveCharacters = debounce((characters: Character[]) => {
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
}, 300);

export const saveCharacters = (characters: Character[]): void => {
  debouncedSaveCharacters(characters);
};

export const getConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return stored ? JSON.parse(stored) : [];
};

const debouncedSaveConversations = debounce((conversations: Conversation[]) => {
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
}, 300);

export const saveConversations = (conversations: Conversation[]): void => {
  debouncedSaveConversations(conversations);
};

export const exportData = (): ExportData => {
  return {
    version: '1.0',
    exportDate: Date.now(),
    settings: getSettings(),
    characters: getCharacters(),
    conversations: getConversations(),
  };
};

export const importData = (data: ExportData): void => {
  if (data.settings) {
    saveSettings(data.settings);
  }
  if (data.characters) {
    saveCharacters(data.characters);
  }
  if (data.conversations) {
    saveConversations(data.conversations);
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
