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

export interface Conversation {
  id: string;
  characterId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'openai' | 'openrouter';
}

export interface AppSettings {
  apiKey: string;
  selectedModelId: string;
  selectedCharacterId: string;
  currentConversationId: string;
  darkMode: boolean;
}

export interface ExportData {
  version: string;
  exportDate: number;
  settings: AppSettings;
  characters: Character[];
  conversations: Conversation[];
}
