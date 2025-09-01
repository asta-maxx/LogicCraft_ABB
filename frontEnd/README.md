# LogicCraft AI Frontend

A professional frontend application for generating industrial control code (IEC 61131-3) using natural language and AI. Built with Next.js 14, NextUI v2, and Monaco Editor.

## Features

- **Natural Language Input**: Describe your control logic requirements in plain English
- **Voice-to-Text**: Use speech recognition for hands-free input
- **AI Code Generation**: Generate IEC 61131-3 structured text code
- **Code Validation**: Validate generated code with detailed error reporting
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Feedback**: Loading states, toasts, and visual indicators

## Prerequisites

- Node.js 18+ and npm
- A modern browser with Web Speech API support (Chrome, Edge, Safari) for voice input

## Installation

1. Unzip the project files
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Connecting the Backend

This frontend is designed to work with a LogicCraft AI backend API. The backend should:

1. Run on `http://localhost:8000` (or update the `NEXT_PUBLIC_API_BASE_URL` environment variable)
2. Provide the following endpoints:
   - `POST /api/generate` - Generate control code from natural language
   - `POST /api/validate` - Validate IEC 61131-3 code
3. Have CORS configured to accept requests from `http://localhost:3000`

### API Endpoints

#### POST /api/generate
**Request Body:**
```json
{
  "input": "string"
}
```

**Success Response (200):**
```json
{
  "code": "string",
  "source": "llm" | "cache"
}
```

#### POST /api/validate
**Request Body:**
```json
{
  "code": "string"
}
```

**Success Response (200):**
```json
{
  "valid": boolean,
  "errors": "string" | null,
  "warnings": "string" | null
}
```

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and NextUI imports
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main application page
│   └── providers.tsx        # NextUI and toast providers
├── components/
│   ├── GeneratedCodeEditor.tsx    # Monaco editor and action buttons
│   ├── NaturalLanguageInput.tsx   # Input area with voice controls
│   └── ValidationResults.tsx      # Validation output display
├── hooks/
│   └── useSpeechToText.ts         # Custom speech-to-text hook
├── lib/
│   └── utils.ts                   # Utility functions
└── README.md
```

### Key Components

- **`app/page.tsx`**: Main application page with state management for input text, generated code, loading states, and validation results
- **`hooks/useSpeechToText.ts`**: Custom hook for speech-to-text functionality with browser compatibility checks
- **`components/NaturalLanguageInput.tsx`**: Input area with textarea and microphone button for voice input
- **`components/GeneratedCodeEditor.tsx`**: Monaco editor with copy and validate functionality
- **`components/ValidationResults.tsx`**: Displays validation results with color-coded success, error, and warning states

## How to Use

1. **Input Requirements**: Type or speak your control logic requirements in the textarea
2. **Generate Code**: Click "Generate Control Code" to create IEC 61131-3 structured text
3. **Edit Code**: Use the Monaco editor to review and modify the generated code
4. **Validate**: Click "Validate" to check your code for errors and warnings
5. **Copy**: Use the copy button to copy the final code to your clipboard

## Styling and Customization

### Theme Configuration
The app uses NextUI v2 with a custom theme defined in `tailwind.config.ts`. The color palette includes:
- **Primary**: Blue (#006FEE) for main actions
- **Secondary**: Purple (#7828C8) for secondary actions
- **Success**: Green (#17C964) for positive indicators
- **Danger**: Red (#F31260) for errors and warnings

### Responsive Design
- **Desktop**: Two-column layout (40% input, 60% editor)
- **Mobile**: Single column, stacked vertically
- **Breakpoint**: `lg` (1024px)

### Modifying Styles
- Global styles: `app/globals.css`
- Theme colors: `tailwind.config.ts` NextUI theme configuration
- Component styles: Individual component files using Tailwind classes

## Browser Compatibility

### Voice Input
Voice input requires a browser that supports the Web Speech API:
- ✅ Chrome (all platforms)
- ✅ Edge (Windows, macOS)
- ✅ Safari (macOS, iOS)
- ❌ Firefox (limited support)

The microphone button is automatically hidden in unsupported browsers.

### General Compatibility
- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Browser)

## Building for Production

```bash
npm run build
```

The app is configured for static export and can be deployed to any static hosting service.

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Ensure the backend is running and CORS is properly configured
2. **Voice Input Not Working**: Check browser compatibility and microphone permissions
3. **Monaco Editor Not Loading**: Ensure all dependencies are installed correctly

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (default: `http://localhost:8000/api`)

## Development

To extend the application:

1. **Add New Components**: Create in `components/` directory
2. **Add New Hooks**: Create in `hooks/` directory  
3. **Modify API Calls**: Update functions in `app/page.tsx`
4. **Style Changes**: Update `tailwind.config.ts` or component-specific classes

## License

This project is built for LogicCraft AI and follows modern web development best practices.