'use client';

import { useState } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { NaturalLanguageInput } from '@/components/NaturalLanguageInput';
import { GeneratedCodeEditor } from '@/components/GeneratedCodeEditor';
import { ValidationResults } from '@/components/ValidationResults';
import toast from 'react-hot-toast';

interface ValidationResult {
  valid: boolean;
  errors: string | null;
  warnings: string | null;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setValidationResult(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedCode(data.code);
      
      toast.success(
        data.source === 'cache' 
          ? 'Code retrieved from cache' 
          : 'Code generated successfully'
      );
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code. Please check if the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (!generatedCode.trim()) return;

    setIsValidating(true);
    
    try {
      const response = await fetch(`${apiBaseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: generatedCode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setValidationResult(data);
      
      if (data.valid) {
        toast.success('Code validation completed');
      } else {
        toast.error('Code validation found issues');
      }
    } catch (error) {
      console.error('Error validating code:', error);
      toast.error('Failed to validate code. Please check if the backend is running.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Header */}
      <header className="border-b border-divider bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <img src="/logo.png" alt="LogicCraft Logo" className="w-20 h-20" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">LogicCraft AI</h1>
              <p className="text-sm text-muted-foreground">
                Generate IEC 61131-3 industrial control code using natural language
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            <NaturalLanguageInput
              inputText={inputText}
              setInputText={setInputText}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
            
            {validationResult && (
              <ValidationResults validationResult={validationResult} />
            )}
          </div>

          {/* Right Column - Code Editor */}
          <div className="lg:col-span-3">
            <GeneratedCodeEditor
              generatedCode={generatedCode}
              setGeneratedCode={setGeneratedCode}
              onValidate={handleValidate}
              isValidating={isValidating}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto shadow-sm">
            <CardBody className="py-6">
              <h3 className="text-lg font-semibold mb-3 text-foreground">
                How to Use LogicCraft AI
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <p>Describe your control logic requirements in plain English or use voice input</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <p>Click "Generate Control Code" to create IEC 61131-3 structured text</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <p>Validate your code and make any necessary edits in the editor</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}