'use client';

import { Card, CardBody, CardHeader, Textarea, Button } from '@nextui-org/react';
import { Mic, MicOff } from 'lucide-react';
import useSpeechToText from '@/hooks/useSpeechToText';
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
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setInputText(inputText ? inputText + ' ' + transcript : transcript);
      resetTranscript();
    }
  }, [transcript, inputText, resetTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Card className="h-fit shadow-md p-2 sm:p-4">
      <CardHeader className="pb-2">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Describe Your Control Logic
        </h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="relative mb-8">
          <Textarea
            placeholder="Example: Create a conveyor belt control system that starts when a start button is pressed, stops when a stop button is pressed, and has an emergency stop that immediately halts all operations..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            minRows={16}
            maxRows={32}
            variant="bordered"
            color={isListening ? 'danger' : 'default'}
            className="w-full text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm text-white border border-gray-300"
            classNames={{
              input: 'text-xs sm:text-sm leading-relaxed text-white',
              inputWrapper: 'border-2 border-gray-300 transition-colors duration-200',
            }}
          />
          {isSupported ? (
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
          ) : (
            <div className="absolute top-3 right-3 z-10 text-xs text-gray-400">
              Speech recognition not supported
            </div>
          )}
        </div>

        {isListening && (
          <div className="text-danger text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
            Listening for voice input...
          </div>
        )}
        {error && (
          <div className="text-danger text-xs mt-2">
            {error}
          </div>
        )}

      </CardBody>
      <div className="px-6 pb-6">
        <Button
          color="primary"
          size="lg"
          onPress={onGenerate}
          isLoading={isGenerating}
          isDisabled={!inputText.trim() || isGenerating}
          className="w-full font-medium text-base sm:text-lg"
        >
          {isGenerating ? 'Generating Code...' : 'Generate Control Code'}
        </Button>
      </div>
  </Card>
  );
}