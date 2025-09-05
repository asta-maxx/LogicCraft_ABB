'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  Code,
  Copy,
  FileText,
  History,
  Loader2,
  Mic,
  MicOff,
  Moon,
  Play,
  Sparkles,
  Sun,
  Volume2,
  Zap
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

// Custom hooks for speech functionality with fallbacks
const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(({ text }: { text: string }) => {
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  }, []);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, cancel, speaking };
};

const useSpeechRecognition = ({ onResult }: { onResult: (result: string) => void }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const listen = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setListening(true);
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        onResult(result);
        setListening(false);
      };

      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  }, [onResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, []);

  return { listen, listening, stop };
};

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-300">Loading Monaco Editor...</p>
      </div>
    </div>
  )
});

interface Generation {
  id: string;
  prompt: string;
  code: string;
  timestamp: Date;
}

const examplePrompts = [
  "Create a timer function block that counts down from 10 seconds",
  "Generate a motor control function with start, stop, and emergency stop inputs",
  "Write a PID controller for temperature regulation",
  "Create a traffic light sequence controller with 3 states",
  "Generate a conveyor belt control system with sensors",
  "Write a safety interlock function for industrial equipment"
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speech recognition and synthesis
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result: string) => {
      setPrompt(prev => prev + ' ' + result);
    },
  });

  // Load theme and generations from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('iec-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const saved = localStorage.getItem('iec-generations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGenerations(parsed.map((g: any) => ({ ...g, timestamp: new Date(g.timestamp) })));
      } catch (e) {
        console.error('Failed to parse saved generations:', e);
      }
    }
  }, []);

  // Save generations to localStorage whenever they change
  useEffect(() => {
    if (generations.length > 0) {
      localStorage.setItem('iec-generations', JSON.stringify(generations));
    }
  }, [generations]);

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('iec-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('iec-theme', 'light');
    }
  }, [isDarkMode]);

  const handleVoiceInput = useCallback(() => {
    if (listening) {
      stop();
    } else {
      listen();
    }
  }, [listening, listen, stop]);

  const speakCode = useCallback(() => {
    if (speaking) {
      cancel();
    } else if (generatedCode) {
      speak({ text: `Generated code: ${generatedCode}` });
    }
  }, [speaking, generatedCode, speak, cancel]);

const handleGenerate = useCallback(async () => {
  if (!prompt.trim()) return;

  setIsGenerating(true);
  setValidationStatus('idle');

  try {
    const res = await fetch("http://127.0.0.1:8000/api/rag/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: prompt, max_new_tokens: 200 })
    });

    const data = await res.json();
    setGeneratedCode(data.answer);  // backend returns { "answer": "..." }

    // Save to history
    const newGeneration: Generation = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      code: data.answer,
      timestamp: new Date()
    };
    setGenerations(prev => [newGeneration, ...prev.slice(0, 9)]);

  } catch (error) {
    console.error("Generation failed:", error);
    setGeneratedCode("// Error: Failed to generate code. Please try again.");
  } finally {
    setIsGenerating(false);
  }
}, [prompt]);

  const handleValidate = useCallback(async () => {
    if (!generatedCode.trim()) return;

    setIsValidating(true);
    
    try {
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation result
      const isValid = !generatedCode.includes('ERROR') && generatedCode.includes('FUNCTION_BLOCK');
      setValidationStatus(isValid ? 'valid' : 'invalid');
      
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationStatus('invalid');
    } finally {
      setIsValidating(false);
    }
  }, [generatedCode]);

  const handleSimulate = useCallback(async () => {
    if (!generatedCode.trim()) return;

    setIsSimulating(true);
    
    try {
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Simulation completed successfully! Check console for detailed results.');
      
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed. Please check your code syntax.');
    } finally {
      setIsSimulating(false);
    }
  }, [generatedCode]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!generatedCode.trim()) return;

    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [generatedCode]);

  const loadGeneration = useCallback((generation: Generation) => {
    setPrompt(generation.prompt);
    setGeneratedCode(generation.code);
    setValidationStatus('idle');
  }, []);

  const useExamplePrompt = useCallback((example: string) => {
    setPrompt(example);
  }, []);

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b shadow-sm transition-colors duration-300",
        isDarkMode 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-blue-100"
      )}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={cn(
                  "text-2xl font-bold transition-colors duration-300",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  IEC 61131 Code Generator
                </h1>
                <p className="text-sm text-blue-600 font-medium">ABB Industrial Automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className={cn(
                  "transition-colors duration-300",
                  isDarkMode 
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                    : "border-blue-200 text-blue-600 hover:bg-blue-50"
                )}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Badge variant="outline" className={cn(
                "transition-colors duration-300",
                isDarkMode 
                  ? "text-blue-400 border-blue-400 bg-blue-950" 
                  : "text-blue-600 border-blue-200 bg-blue-50"
              )}>
                Professional Edition
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Input and Examples */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Prompt Input */}
            <Card className={cn(
              "shadow-lg transition-colors duration-300",
              isDarkMode 
                ? "border-gray-700 bg-gray-800" 
                : "border-blue-200 bg-white"
            )}>
              <CardHeader className={cn(
                "text-white rounded-t-lg transition-colors duration-300",
                isDarkMode 
                  ? "bg-gradient-to-r from-blue-700 to-blue-800" 
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              )}>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Describe Your Function</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <Textarea
                    placeholder="Enter a detailed description of the function block you want to generate... (or use voice input)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={cn(
                      "min-h-32 focus:ring-blue-200 transition-colors duration-300",
                      isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white focus:border-blue-400 placeholder:text-gray-400" 
                        : "border-blue-200 bg-white focus:border-blue-500 placeholder:text-gray-500"
                    )}
                    rows={6}
                  />
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceInput}
                      className={cn(
                        "transition-all duration-300",
                        listening 
                          ? "text-red-500 hover:text-red-600 animate-pulse" 
                          : isDarkMode 
                            ? "text-gray-400 hover:text-blue-400" 
                            : "text-gray-500 hover:text-blue-600"
                      )}
                    >
                      {listening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    {generatedCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={speakCode}
                        className={cn(
                          "transition-all duration-300",
                          speaking 
                            ? "text-green-500 hover:text-green-600 animate-pulse" 
                            : isDarkMode 
                              ? "text-gray-400 hover:text-blue-400" 
                              : "text-gray-500 hover:text-blue-600"
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {listening && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-red-500 animate-pulse">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span>Listening... Speak now</span>
                  </div>
                )}
                
                <div className="mt-4 flex flex-col gap-2">
                  <Button 
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={cn(
                      "w-full text-white font-medium py-3 transition-all duration-300",
                      isDarkMode 
                        ? "bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900" 
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate IEC 61131 Code
                      </>
                    )}
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleValidate}
                      disabled={!generatedCode.trim() || isValidating}
                      className={cn(
                        "transition-colors duration-300",
                        isDarkMode 
                          ? "border-gray-600 text-blue-400 hover:bg-gray-700" 
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleSimulate}
                      disabled={!generatedCode.trim() || isSimulating}
                      className={cn(
                        "transition-colors duration-300",
                        isDarkMode 
                          ? "border-gray-600 text-blue-400 hover:bg-gray-700" 
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      {isSimulating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleCopyToClipboard}
                      disabled={!generatedCode.trim()}
                      className={cn(
                        "transition-all duration-300",
                        copySuccess 
                          ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
                          : isDarkMode 
                            ? "border-gray-600 text-blue-400 hover:bg-gray-700" 
                            : "border-blue-200 text-blue-600 hover:bg-blue-50"
                      )}
                    >
                      {copySuccess ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {validationStatus !== 'idle' && (
                    <div className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors duration-300",
                      validationStatus === 'valid' 
                        ? isDarkMode
                          ? "bg-green-950 text-green-400 border border-green-800"
                          : "bg-green-50 text-green-700 border border-green-200"
                        : isDarkMode
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : "bg-red-50 text-red-700 border border-red-200"
                    )}>
                      {validationStatus === 'valid' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>
                        {validationStatus === 'valid' 
                          ? "Code validation successful" 
                          : "Code contains syntax errors"
                        }
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card className={cn(
              "shadow-lg transition-colors duration-300",
              isDarkMode 
                ? "border-gray-700 bg-gray-800" 
                : "border-blue-200 bg-white"
            )}>
              <CardHeader className={cn(
                "border-b transition-colors duration-300",
                isDarkMode 
                  ? "bg-gray-750 border-gray-700" 
                  : "bg-blue-50 border-blue-100"
              )}>
                <CardTitle className={cn(
                  "flex items-center space-x-2 transition-colors duration-300",
                  isDarkMode ? "text-blue-400" : "text-blue-800"
                )}>
                  <Zap className="w-5 h-5" />
                  <span>Example Prompts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => useExamplePrompt(example)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all duration-200 text-sm",
                        isDarkMode 
                          ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700 text-gray-300" 
                          : "border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                      )}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Generations */}
            {generations.length > 0 && (
              <Card className={cn(
                "shadow-lg transition-colors duration-300",
                isDarkMode 
                  ? "border-gray-700 bg-gray-800" 
                  : "border-blue-200 bg-white"
              )}>
                <CardHeader className={cn(
                  "border-b transition-colors duration-300",
                  isDarkMode 
                    ? "bg-gray-750 border-gray-700" 
                    : "bg-blue-50 border-blue-100"
                )}>
                  <CardTitle className={cn(
                    "flex items-center space-x-2 transition-colors duration-300",
                    isDarkMode ? "text-blue-400" : "text-blue-800"
                  )}>
                    <History className="w-5 h-5" />
                    <span>Recent Generations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {generations.map((generation) => (
                        <button
                          key={generation.id}
                          onClick={() => loadGeneration(generation)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all duration-200",
                            isDarkMode 
                              ? "border-gray-600 hover:border-blue-500 hover:bg-gray-700" 
                              : "border-blue-100 hover:border-blue-300 hover:bg-blue-50"
                          )}
                        >
                          <p className={cn(
                            "text-sm font-medium line-clamp-2 mb-1 transition-colors duration-300",
                            isDarkMode ? "text-gray-200" : "text-gray-900"
                          )}>
                            {generation.prompt}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {generation.timestamp.toLocaleString()}
                          </p>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Code Editor */}
          <div className="lg:col-span-2">
            <Card className={cn(
              "shadow-lg h-full transition-colors duration-300",
              isDarkMode 
                ? "border-gray-700 bg-gray-800" 
                : "border-blue-200 bg-white"
            )}>
              <CardHeader className={cn(
                "text-white rounded-t-lg transition-colors duration-300",
                isDarkMode 
                  ? "bg-gradient-to-r from-blue-700 to-blue-800" 
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              )}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5" />
                    <span>Generated IEC 61131-3 Structured Text</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {generatedCode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={speakCode}
                        className={cn(
                          "text-white hover:bg-white/20 transition-all duration-300",
                          speaking && "animate-pulse"
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Badge variant="secondary" className={cn(
                      "transition-colors duration-300",
                      isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-800 text-blue-100"
                    )}>
                      ST
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 h-[calc(100vh-12rem)]">
                <div className={cn(
                  "h-full rounded-lg border overflow-hidden transition-colors duration-300",
                  isDarkMode ? "border-gray-600" : "border-blue-200"
                )}>
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="plaintext"
                    value={generatedCode || '// Generated IEC 61131-3 Structured Text will appear here...\n// Use the prompt area to describe your function block or use voice input'}
                    theme={isDarkMode ? 'vs-dark' : 'vs'}
                    options={{
                      fontSize: 14,
                      lineNumbers: 'on',
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      automaticLayout: true,
                      fontFamily: 'Monaco, Menlo, Consolas, monospace',
                      tabSize: 4,
                      insertSpaces: true,
                      renderWhitespace: 'selection',
                      showUnused: true,
                      folding: true,
                      foldingHighlight: true,
                      bracketPairColorization: { enabled: true },
                      guides: {
                        bracketPairs: true,
                        indentation: true
                      }
                    }}
                    onMount={(editor, monaco) => {
                      // Register IEC 61131-3 Structured Text language
                      monaco.languages.register({ id: 'iec61131st' });
                      
                      // Define syntax highlighting
                      monaco.languages.setMonarchTokensProvider('iec61131st', {
                        tokenizer: {
                          root: [
                            // Comments
                            [/\/\/.*/, 'comment'],
                            [/\/\*[\s\S]*?\*\//, 'comment'],
                            
                            // Keywords
                            [/\b(FUNCTION_BLOCK|FUNCTION|PROGRAM|VAR|VAR_INPUT|VAR_OUTPUT|VAR_IN_OUT|VAR_TEMP|VAR_EXTERNAL|VAR_ACCESS|VAR_CONFIG|VAR_GLOBAL|END_VAR|IF|THEN|ELSE|ELSIF|END_IF|CASE|OF|END_CASE|FOR|TO|BY|DO|END_FOR|WHILE|END_WHILE|REPEAT|UNTIL|END_REPEAT|AND|OR|NOT|XOR|MOD|TRUE|FALSE)\b/, 'keyword'],
                            
                            // Data types
                            [/\b(BOOL|BYTE|WORD|DWORD|LWORD|SINT|INT|DINT|LINT|USINT|UINT|UDINT|ULINT|REAL|LREAL|TIME|DATE|TIME_OF_DAY|TOD|DATE_AND_TIME|DT|STRING|WSTRING)\b/, 'type'],
                            
                            // Operators
                            [/[:=<>!]=?|[+\-*/]/, 'operator'],
                            
                            // Numbers
                            [/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'number'],
                            
                            // Strings
                            [/'[^']*'/, 'string'],
                            [/"[^"]*"/, 'string'],
                            
                            // Identifiers
                            [/[a-zA-Z_]\w*/, 'identifier'],
                          ],
                        },
                      });
                      
                      // Set the language for the editor
                      monaco.editor.setModelLanguage(editor.getModel()!, 'iec61131st');
                    }}
                  />
                </div>
                
                {/* Action Buttons Row */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    )}>
                      Actions:
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleValidate}
                        disabled={!generatedCode.trim() || isValidating}
                        className={cn(
                          "transition-colors duration-300",
                          isDarkMode 
                            ? "border-gray-600 text-blue-400 hover:bg-gray-700" 
                            : "border-blue-200 text-blue-600 hover:bg-blue-50"
                        )}
                      >
                        {isValidating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Validate
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSimulate}
                        disabled={!generatedCode.trim() || isSimulating}
                        className={cn(
                          "transition-colors duration-300",
                          isDarkMode 
                            ? "border-gray-600 text-blue-400 hover:bg-gray-700" 
                            : "border-blue-200 text-blue-600 hover:bg-blue-50"
                        )}
                      >
                        {isSimulating ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        Simulate
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                    disabled={!generatedCode.trim()}
                    className={cn(
                      "transition-all duration-300",
                      copySuccess 
                        ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
                        : isDarkMode 
                          ? "border-gray-600 text-blue-400 hover:bg-gray-700" 
                          : "border-blue-200 text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "mt-12 pt-8 border-t transition-colors duration-300",
          isDarkMode ? "border-gray-700" : "border-blue-100"
        )}>
          <div className="text-center text-sm">
            <p className="mb-2">
              <span className={cn(
                "font-semibold transition-colors duration-300",
                isDarkMode ? "text-blue-400" : "text-blue-600"
              )}>
                ABB IEC 61131 Code Generator
              </span>
              <span className={cn(
                "transition-colors duration-300",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                {" "}- Professional industrial automation development tool
              </span>
            </p>
            <p className={cn(
              "transition-colors duration-300",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>
              Powered by advanced AI • Supports IEC 61131-3 Structured Text • 
              <span className={cn(
                "font-medium transition-colors duration-300",
                isDarkMode ? "text-blue-400" : "text-blue-600"
              )}>
                {" "}Enterprise Grade Security
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}