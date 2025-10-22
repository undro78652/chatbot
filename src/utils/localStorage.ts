import { AppSettings, Character, Conversation, ExportData } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'chatbot_settings',
  CHARACTERS: 'chatbot_characters',
  CONVERSATIONS: 'chatbot_conversations',
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  selectedModelId: 'gpt-3.5-turbo',
  selectedCharacterId: '',
  currentConversationId: '',
  darkMode: false,
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
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getCharacters = (): Character[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
  if (stored) {
    return JSON.parse(stored);
  }
  saveCharacters(DEFAULT_CHARACTERS);
  return DEFAULT_CHARACTERS;
};

export const saveCharacters = (characters: Character[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
};

export const getConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveConversations = (conversations: Conversation[]): void => {
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
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
