# AI Chatbot Application

A feature-rich, production-ready AI chatbot interface built with React, TypeScript, and Tailwind CSS. This application provides a sophisticated chat experience with support for multiple AI providers, custom characters, and extensive customization options.

## Features

### Core Functionality

- **Multi-Provider AI Support**: Compatible with OpenAI and OpenRouter APIs
- **Custom Model Integration**: Add unlimited custom AI models with custom endpoints
- **Character System**: Create and customize AI personas with unique system prompts and visual styling
- **Conversation Management**: Organize chats by character with full conversation history
- **Real-time Chat Interface**: Responsive messaging with loading states and error handling

### Advanced Features

#### Markdown Rendering
- Full markdown support in AI responses including:
  - Code blocks with syntax highlighting
  - Headers, lists, and tables
  - Bold, italic, and inline code
  - Links and blockquotes
- Toggle markdown rendering on/off in settings

#### Message Management
- **Edit Messages**: Modify sent messages inline
- **Resend Messages**: Regenerate responses from any point in the conversation
- **Message Search**: Quick search functionality within conversations
- **Timestamps**: Track when each message was sent

#### Customization Options
- **Dark Mode**: Full dark theme support with smooth transitions
- **Font Size Control**: Choose between small, medium, and large text sizes
- **Auto-scroll Toggle**: Control automatic scrolling behavior
- **Custom Avatar Colors**: Personalize each character with unique colors

#### Data Management
- **Local Storage**: All data stored securely in your browser
- **Full Export/Import**: Backup and restore all app data via JSON
- **Per-Character Export**: Export individual characters with their conversations
- **No Server Required**: Everything runs client-side for complete privacy

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Loading Indicators**: Clear visual feedback during AI processing
- **Error Handling**: Graceful error messages with helpful troubleshooting info
- **Intuitive UI**: Clean, modern interface with smooth animations

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- An API key from OpenAI or OpenRouter

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Configuration

1. **Add API Key**:
   - Click the "Settings" button in the sidebar
   - Select the "General" tab
   - Click "Add Key" and enter your API key
   - Choose your provider (OpenAI or OpenRouter)

2. **Create Custom Models** (Optional):
   - Open Settings → Models tab
   - Click "Add Model"
   - Enter model details:
     - Model Name (display name)
     - Model ID (API identifier)
     - Custom Endpoint (optional)

3. **Customize Characters**:
   - Click the "+" button next to "Characters" in the sidebar
   - Set name, description, and system prompt
   - Choose an avatar color

## Usage Guide

### Starting a Conversation

1. Select a character from the sidebar
2. Type your message in the input box
3. Press Enter or click "Send"
4. Watch the AI respond in real-time

### Managing Conversations

- **New Conversation**: Click the "+" next to "Conversations"
- **Switch Conversations**: Click any conversation in the sidebar
- **Delete Conversation**: Hover and click the trash icon

### Editing Messages

1. Hover over any user message
2. Click the edit icon
3. Modify the text
4. Click "Save"

### Resending Messages

1. Hover over any user message
2. Click the resend icon
3. The conversation regenerates from that point

### Exporting Data

- **Full Export**: Sidebar → Export button → Downloads JSON file
- **Character Export**: (Coming in next update)

### Importing Data

1. Click "Import" in the sidebar
2. Select a previously exported JSON file
3. All data will be restored

## Settings Overview

### General Tab
- API Key management
- Auto-scroll toggle
- Markdown rendering toggle

### Models Tab
- View all available models
- Add custom models
- Edit/delete custom models

### Display Tab
- Font size selection
- Dark mode toggle

## Technical Details

### Architecture

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks with local storage persistence
- **Markdown**: react-markdown with GitHub Flavored Markdown support
- **Build Tool**: Vite for fast development and optimized production builds

### Data Storage

All data is stored in browser localStorage:
- `chatbot_settings`: User preferences and API keys
- `chatbot_characters`: Character definitions
- `chatbot_conversations`: Message history

### Security

- API keys stored locally, never transmitted to any server
- All API calls made directly from browser to AI provider
- No analytics or tracking
- Open source for transparency

## Keyboard Shortcuts

- `Enter`: Send message
- `Escape`: Close modals
- `Tab`: Navigate through form fields

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Privacy

This application:
- Does NOT collect any user data
- Does NOT send data to any third-party servers (except AI providers)
- Stores everything locally in your browser
- Requires no account or registration

## Troubleshooting

### API Key Issues
- Ensure your API key is valid and active
- Check that you've selected the correct provider
- Verify your API key has sufficient credits/quota

### Messages Not Sending
- Check your internet connection
- Verify API key is configured
- Look for error messages in the chat

### Data Not Persisting
- Ensure browser allows localStorage
- Check that you're not in incognito/private mode
- Try exporting and reimporting your data

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- React
- TypeScript
- Tailwind CSS
- react-markdown
- Lucide React (icons)

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
