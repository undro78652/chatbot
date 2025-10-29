# AI Chatbot Application

A production-ready, feature-rich AI chatbot interface built with React, TypeScript, and Tailwind CSS. This application provides a sophisticated chat experience with support for multiple AI providers (OpenAI, OpenRouter, Anthropic), custom characters, and extensive customization options—all running entirely in your browser with complete privacy.

## 🚀 Key Features

### 🤖 Multi-Provider AI Support

- **OpenAI Integration**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo support
- **OpenRouter Integration**: Access to multiple AI models through OpenRouter
- **Anthropic Integration**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Multiple API Keys**: Store and manage API keys for all three providers simultaneously
- **Custom Models**: Add unlimited custom AI models with custom endpoints
- **Provider Selection**: Visual badges showing which provider each model belongs to

### 💬 Advanced Message Management

- **Message Copy**: One-click copy button for all messages
- **Delete Message Pairs**: Remove user questions and AI responses together
- **Edit Messages**: Modify sent messages inline and regenerate responses
- **Resend Messages**: Regenerate AI responses from any point in the conversation
- **Message Timestamps**: Toggle-able timestamps for each message
- **Import Messages**: Import conversation history from JSON format
- **Multi-line Input**: Use `Shift + Enter` for new lines, `Enter` to send

### 🎨 Character System

- **Custom Characters**: Create unlimited AI personas with unique system prompts
- **Visual Customization**: Choose custom avatar colors for each character
- **Per-Character Conversations**: Organize chats by character with full history
- **Character Management**: Easy creation, editing, and deletion of characters

### 💾 Conversation Management

- **Auto-Generated Titles**: Conversations automatically titled from first message
- **Global Search**: Search across all conversations by title or content
- **In-Chat Search**: Search within specific conversation threads
- **Single Conversation Export**: Export individual conversations with metadata
- **Full Data Export/Import**: Backup and restore all app data via JSON
- **Sidebar Toggle**: Collapsible sidebar for distraction-free chatting
- **Conversation History**: Complete message history stored locally

### ⚙️ Per-Conversation Settings

- **Temperature Control**: Adjust AI creativity/randomness per conversation (0.0 - 2.0)
- **System Prompt Override**: Override character's default system prompt per conversation
- **Max Tokens Control**: Set maximum response length (256 - 4096 tokens)
- **Persistent Settings**: Conversation settings saved independently

### 📊 Advanced Features

- **Real-time Token Counter**: 
  - Live estimation of token usage with color-coded feedback
  - Visual indicators: Green (low), Yellow (moderate), Orange (high), Red (very high)
  - Context limit warnings
- **Markdown Rendering**: 
  - Full GitHub Flavored Markdown support
  - Code blocks with syntax highlighting
  - Headers, lists, tables, links, blockquotes
  - Toggle markdown rendering on/off
- **Error Boundary**: Graceful error handling with fallback UI
- **Performance Optimized**: 
  - React.memo on all components
  - useMemo and useCallback for expensive operations
  - Debounced localStorage writes
  - Minimized re-renders

### 🎨 Customization & UI

- **Dark Mode**: Full dark theme support with smooth transitions (fixed and working!)
- **Font Size Control**: Small, medium, and large text options
- **Auto-scroll Toggle**: Control automatic scrolling behavior
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean interface with Lucide React icons
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 🔒 Privacy & Security

- **100% Client-Side**: Everything runs in your browser
- **No Backend Required**: No server, no database, no account needed
- **Local Storage Only**: All data stored securely in browser localStorage
- **API Keys Protected**: Keys stored locally, never transmitted to third parties
- **Direct API Calls**: Browser connects directly to AI providers
- **No Analytics**: Zero tracking, complete privacy
- **Open Source**: Fully transparent codebase

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- An API key from OpenAI, OpenRouter, or Anthropic (or all three!)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Run type checking**
   ```bash
   npm run typecheck
   ```

6. **Run linter**
   ```bash
   npm run lint
   ```

## 🎯 Quick Start Guide

### 1. Configure API Keys

1. Click **Settings** button in the sidebar
2. Navigate to **API Configuration** section
3. Click **Manage Keys**
4. Enter your API keys for:
   - **OpenAI**: Get key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **OpenRouter**: Get key from [OpenRouter](https://openrouter.ai/keys)
   - **Anthropic**: Get key from [Anthropic Console](https://console.anthropic.com/)
5. Save your keys (stored locally in your browser)

### 2. Create a Character

1. Click the **+** button next to "Characters" in sidebar
2. Fill in:
   - **Name**: Character's display name
   - **Description**: Brief description (optional)
   - **System Prompt**: Instructions for AI behavior
   - **Avatar Color**: Choose a color theme
3. Click **Save Character**

### 3. Start Chatting

1. Select your character from the sidebar
2. Choose an AI model from the dropdown (shows provider badge)
3. Type your message (use `Shift + Enter` for new lines)
4. Press `Enter` to send
5. Watch the AI respond in real-time

### 4. Advanced Usage

#### Adjust Conversation Settings
1. Click the **Sliders** icon in chat header
2. Adjust:
   - Temperature (0.0 = focused, 2.0 = creative)
   - Max Tokens (response length)
   - System Prompt Override
3. Settings apply only to current conversation

#### Import Message History
1. Click the **Upload** icon in chat header
2. Paste JSON array of messages:
   ```json
   [
     { "role": "user", "content": "Hello!" },
     { "role": "assistant", "content": "Hi there!" }
   ]
   ```
3. Messages append to current conversation

#### Search Conversations
1. Use search box in sidebar to filter all conversations
2. Searches both titles and message content
3. Instantly filters results as you type

#### Export Single Conversation
1. Click the **Download** icon in chat header
2. Saves JSON file with:
   - Character name
   - Model used
   - All messages with timestamps
   - Export date

## ⌨️ Keyboard Shortcuts

- `Enter`: Send message
- `Shift + Enter`: New line in message input
- `Escape`: Close modals
- `Tab`: Navigate form fields

## 🛠️ Technical Architecture

### Tech Stack

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript 5.5**: Full type safety
- **Vite 5**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling with dark mode
- **react-markdown**: Markdown rendering with GFM support
- **Lucide React**: Beautiful, consistent icons
- **UUID**: Unique ID generation

### Project Structure

```
src/
├── components/         # React components (all memoized)
│   ├── ApiKeyModal.tsx
│   ├── CharacterModal.tsx
│   ├── ChatInterface.tsx
│   ├── ConversationSettingsModal.tsx
│   ├── CustomModelModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── MarkdownMessage.tsx
│   ├── SettingsPanel.tsx
│   └── Sidebar.tsx
├── utils/             # Utility functions
│   ├── aiService.ts   # API integration for all providers
│   ├── debounce.ts    # Debouncing utility
│   ├── localStorage.ts # Storage management with debouncing
│   ├── titleGenerator.ts # Auto-title generation
│   └── tokenCounter.ts # Token estimation logic
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
└── main.tsx           # Entry point with Error Boundary

```

### Performance Optimizations

1. **Component Memoization**: All components wrapped with `React.memo`
2. **Callback Memoization**: All handlers use `useCallback`
3. **Value Memoization**: Expensive computations use `useMemo`
4. **Debounced Writes**: localStorage saves debounced (300ms)
5. **Minimal Re-renders**: Optimized dependency arrays
6. **Lazy Evaluation**: Computed values only when needed

### Data Storage

All data stored in browser localStorage:
- `chatbot_settings`: User preferences, API keys, selected IDs
- `chatbot_characters`: Character definitions with system prompts
- `chatbot_conversations`: Message history with per-conversation settings

### API Integration

#### OpenAI
```typescript
Endpoint: https://api.openai.com/v1/chat/completions
Headers: { Authorization: `Bearer ${apiKey}` }
```

#### OpenRouter
```typescript
Endpoint: https://openrouter.ai/api/v1/chat/completions
Headers: { Authorization: `Bearer ${apiKey}` }
```

#### Anthropic
```typescript
Endpoint: https://api.anthropic.com/v1/messages
Headers: { 
  x-api-key: apiKey,
  anthropic-version: '2023-06-01'
}
```

## 🎨 Customization

### Adding Custom Models

1. Open **Settings** → **Models** tab
2. Click **Add Custom Model**
3. Enter:
   - Model Name (display)
   - Model ID (API identifier)
   - Provider (openai/openrouter/anthropic/custom)
   - Custom Endpoint (optional)
4. Model appears in dropdown with provider badge

### Color Themes

- Avatar colors fully customizable per character
- Dark mode applies to entire application
- Tailwind's color system easily extendable

### System Prompts

Create sophisticated AI behaviors by customizing:
- **Character-level**: Default prompt for all conversations
- **Conversation-level**: Override for specific chats
- **Examples**: Technical expert, creative writer, code reviewer, etc.

## 🐛 Troubleshooting

### Dark Mode Not Working
✅ **Fixed!** Ensure `tailwind.config.js` has `darkMode: 'class'`

### API Errors

**Invalid API Key**
- Verify key is correct and active
- Check you've selected correct provider
- Ensure API key has sufficient credits

**Rate Limits**
- OpenAI: Check your usage tier
- Anthropic: Review your rate limits
- OpenRouter: Check credit balance

**CORS Errors**
- This shouldn't happen as all APIs support browser requests
- If it does, verify your API key is valid

### Data Not Persisting

- Check browser allows localStorage (not in private/incognito mode)
- Verify you're not clearing cookies/data on exit
- Export data regularly as backup

### Message Not Sending

1. Check internet connection
2. Verify API key configured for selected model's provider
3. Review browser console for errors
4. Try different model or provider

### Performance Issues

- Clear old conversations if you have hundreds
- Use export/import to archive old data
- Check token counter—very long conversations slow down
- Consider starting new conversation after 10k+ tokens

## 🔄 Migration from Old Version

If upgrading from older version with single `apiKey`:
1. Old key automatically migrated to `apiKeys.openai`
2. Add other provider keys in Settings
3. No data loss, seamless migration

## 📊 Token Usage Guide

**Color Indicators:**
- 🟢 **Green (< 2k)**: Low usage, optimal performance
- 🟡 **Yellow (2k-6k)**: Moderate usage, still good
- 🟠 **Orange (6k-12k)**: High usage, approaching limits
- 🔴 **Red (12k+)**: Very high usage, consider new conversation

**Note**: Token counter uses estimation, not exact counts. For precise billing, check provider dashboard.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Deploy to GitHub Pages
```bash
npm run build
# Copy dist/ contents to your gh-pages branch
```

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional AI provider integrations
- More markdown features
- Advanced conversation branching
- Conversation folders/tags
- Conversation analytics
- Better token counting (use tiktoken)
- Voice input/output
- Image support (for multimodal models)

## 📝 Changelog

### Latest Version (Current)
✅ **Added**:
- Multi-provider API key management (OpenAI, OpenRouter, Anthropic)
- Claude 3.5 Sonnet, Opus, and Haiku models
- Message copy button
- Delete message pairs functionality
- Import messages from JSON
- Export single conversations
- Per-conversation settings (temperature, system prompt, max tokens)
- Real-time token counter with color indicators
- Auto-generated conversation titles
- Global and in-conversation search
- Sidebar toggle
- Message timestamp toggle
- Multi-line input support (Shift + Enter)
- Provider badges on model selection

✅ **Fixed**:
- Dark mode now works properly
- Performance optimizations (memo, useMemo, useCallback)
- Debounced localStorage writes
- Error boundary for graceful error handling
- React Hook dependency warnings

✅ **Removed**:
- Unused dependencies (Supabase, rehype-highlight, rehype-raw)
- Dead code (ModelSelector component, unused functions)
- Non-functional search feature (replaced with better version)

✅ **Improved**:
- Unique ID generation using UUID
- Component memoization for better performance
- TypeScript strict type checking
- Code organization and documentation

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🙏 Credits

Built with love using:
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [Lucide Icons](https://lucide.dev/)
- [UUID](https://github.com/uuidjs/uuid)

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check troubleshooting section above
- Review closed issues for solutions

---

**Made by developers, for developers. 100% free, 100% private, 100% yours.** 🚀
