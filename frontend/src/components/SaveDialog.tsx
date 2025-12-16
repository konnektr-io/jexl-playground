import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  currentExpression: string;
  currentContext: string;
}

export function SaveDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  currentExpression,
  currentContext 
}: SaveDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const truncateCode = (code: string, maxLength: number = 100) => {
    return code.length > maxLength ? code.substring(0, maxLength) + '...' : code;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Save Session</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview */}
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="text-xs text-muted-foreground mb-2">Expression:</div>
          <pre className="text-xs font-mono bg-background p-2 rounded border overflow-hidden">
            {truncateCode(currentExpression)}
          </pre>
          <div className="text-xs text-muted-foreground mb-2 mt-3">Context:</div>
          <pre className="text-xs font-mono bg-background p-2 rounded border overflow-hidden">
            {truncateCode(currentContext)}
          </pre>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              Name *
            </label>
            <Input
              placeholder="Enter a name for this session"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">
              Description
            </label>
            <Input
              placeholder="Optional description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Save Session
          </Button>
        </div>
      </div>
    </div>
  );
}
