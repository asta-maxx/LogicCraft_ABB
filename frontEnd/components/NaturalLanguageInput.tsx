'use client';

import { Card, CardBody, CardHeader, Textarea, Button } from '@nextui-org/react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useEffect } from 'react';

interface NaturalLanguageInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function NaturalLanguageInput({
  inputText,
  setInputText,
  onGenerate,
  isGenerating,
}: NaturalLanguageInputProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript, setInputText]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Card className="h-fit shadow-md">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-semibold text-foreground">
          Describe Your Control Logic
        </h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Example: Create a conveyor belt control system that starts when a start button is pressed, stops when a stop button is pressed, and has an emergency stop that immediately halts all operations..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            minRows={6}
            maxRows={12}
            variant="bordered"
            color={isListening ? 'danger' : 'default'}
            className="w-full"
            classNames={{
              input: 'text-sm leading-relaxed',
              inputWrapper: 'border-2 transition-colors duration-200',
            }}
          />
          {isSupported && (
            <Button
              isIconOnly
              size="sm"
              color={isListening ? 'danger' : 'default'}
              variant={isListening ? 'solid' : 'light'}
              className="absolute top-3 right-3 z-10"
              onPress={handleMicClick}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        
        {isListening && (
          <div className="text-danger text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            Listening for voice input...
          </div>
        )}

        <Button
          color="primary"
          size="lg"
          onPress={onGenerate}
          isLoading={isGenerating}
          isDisabled={!inputText.trim() || isGenerating}
          className="w-full font-medium"
        >
          {isGenerating ? 'Generating Code...' : 'Generate Control Code'}
        </Button>
      </CardBody>
    </Card>
  );
}