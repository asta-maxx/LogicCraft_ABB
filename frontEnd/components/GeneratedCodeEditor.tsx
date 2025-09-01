'use client';

import { Card, CardBody, CardHeader, Button } from '@nextui-org/react';
import { Copy, Check, Play } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface GeneratedCodeEditorProps {
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  onValidate: () => void;
  isValidating: boolean;
}

export function GeneratedCodeEditor({
  generatedCode,
  setGeneratedCode,
  onValidate,
  isValidating,
}: GeneratedCodeEditorProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!generatedCode) return;
    
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <Card className="h-fit shadow-md">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Generated Control Code
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="light"
            onPress={handleCopy}
            isDisabled={!generatedCode}
            startContent={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            size="sm"
            color="secondary"
            variant="solid"
            onPress={onValidate}
            isLoading={isValidating}
            isDisabled={!generatedCode || isValidating}
            startContent={!isValidating ? <Play className="w-4 h-4" /> : null}
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="border-2 border-divider rounded-lg overflow-hidden">
          <Editor
            height="500px"
            defaultLanguage="st"
            theme="vs-dark"
            value={generatedCode || '// Generated code will appear here...'}
            onChange={(value) => setGeneratedCode(value || '')}
            options={{
              readOnly: false,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineHeight: 1.5,
              tabSize: 2,
              wordWrap: 'on',
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              suggest: { enabled: true },
              quickSuggestions: true,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
}