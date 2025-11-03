export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  avatarColor: string;
}

export interface ConversationSettings {
  temperature?: number;
  systemPromptOverride?: string;
  maxTokens?: number;
}

export interface Summary {
  id: string;
  content: string;
  messageRange: [number, number];
  tokensSaved: number;
  timestamp: number;
}

export interface Conversation {
  id: string;
  characterId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  title?: string;
  settings?: ConversationSettings;
  summaries?: Summary[];
  lastSummarizedIndex?: number;
  autoSummarize?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'openrouter' | 'anthropic' | 'custom';
  endpoint?: string;
  isCustom?: boolean;
}

export interface AppSettings {
  apiKeys: {
    openai: string;
    openrouter: string;
    anthropic: string;
  };
  selectedModelId: string;
  selectedCharacterId: string;
  currentConversationId: string;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  renderMarkdown: boolean;
  autoScroll: boolean;
  showTimestamps: boolean;
  customModels: AIModel[];
  autoSummarizeThreshold: number;
  keepRecentMessages: number;
  showSummarizeNotifications: boolean;
}

export interface ExportData {
  version: string;
  exportDate: number;
  settings: AppSettings;
  characters: Character[];
  conversations: Conversation[];
}
