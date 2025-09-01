'use client';

import { Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ValidationResult {
  valid: boolean;
  errors: string | null;
  warnings: string | null;
}

interface ValidationResultsProps {
  validationResult: ValidationResult | null;
}

export function ValidationResults({ validationResult }: ValidationResultsProps) {
  if (!validationResult) return null;

  const { valid, errors, warnings } = validationResult;

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Validation Results</h3>
          <Chip
            color={valid ? 'success' : 'danger'}
            variant="flat"
            startContent={
              valid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )
            }
          >
            {valid ? 'Valid' : 'Invalid'}
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {valid && !errors && !warnings && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Code validation successful! No issues found.</span>
          </div>
        )}

        {errors && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-danger">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Errors Found:</span>
            </div>
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
              <pre className="text-sm text-danger whitespace-pre-wrap font-mono">
                {errors}
              </pre>
            </div>
          </div>
        )}

        {warnings && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Warnings:</span>
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <pre className="text-sm text-warning whitespace-pre-wrap font-mono">
                {warnings}
              </pre>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}