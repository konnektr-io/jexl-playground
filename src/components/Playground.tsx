import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { 
  createJexlEditor, 
  createJsonEditor, 
  createReadOnlyEditor, 
  evaluateJexl, 
  parseJsonSafely, 
  formatResult,
  getJsonPathFromOffset
} from '@/lib/monaco-setup';
import { Play, Copy, RefreshCw, FileText, Check, Clock } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { SavedSessions } from './SavedSessions';
import { Examples } from './Examples';
import { SaveDialog } from './SaveDialog';
import { useSavedSessions } from '@/lib/saved-sessions';

// Example data for the playground
const defaultContext = {
  users: [
    { name: "Alice", age: 28, active: true, department: "Engineering" },
    { name: "Bob", age: 32, active: false, department: "Sales" },
    { name: "Charlie", age: 24, active: true, department: "Marketing" },
    { name: "Diana", age: 30, active: true, department: "Engineering" }
  ],
  products: [
    { name: "Laptop", price: 999.99, category: "Electronics", inStock: true },
    { name: "Book", price: 19.99, category: "Education", inStock: false },
    { name: "Coffee", price: 4.50, category: "Food", inStock: true }
  ],
  settings: {
    theme: "dark",
    language: "en",
    notifications: true
  }
};

const defaultExpression = 'users|filter(\'value.active\')|map(\'value.name\')|sort()';

export function Playground() {
  const jexlEditorRef = useRef<HTMLDivElement>(null);
  const contextEditorRef = useRef<HTMLDivElement>(null);
  const outputEditorRef = useRef<HTMLDivElement>(null);
  
  const [jexlEditor, setJexlEditor] = useState<any>(null);
  const [contextEditor, setContextEditor] = useState<any>(null);
  const [outputEditor, setOutputEditor] = useState<any>(null);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<string | null>(null);
  const [contextPath, setContextPath] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Saved sessions hook
  const { sessions, saveSession, deleteSession, loading, autoSaveSession, getAutoSavedSession } = useSavedSessions();

  // Initialize Monaco editors
  useEffect(() => {
    if (!jexlEditorRef.current || !contextEditorRef.current || !outputEditorRef.current) return;

    // Create editors
    const jexl = createJexlEditor(jexlEditorRef.current, defaultExpression);
    const context = createJsonEditor(
      contextEditorRef.current, 
      JSON.stringify(defaultContext, null, 2),
      (offset) => {
        // Use current editor content for path detection
        const currentContent = context.getValue();
        const path = getJsonPathFromOffset(currentContent, offset);
        setContextPath(path);
      }
    );
    const output = createReadOnlyEditor(outputEditorRef.current, '', 'json');

    setJexlEditor(jexl);
    setContextEditor(context);
    setOutputEditor(output);

    // Initial evaluation
    evaluateExpression(defaultExpression, defaultContext);

    // Cleanup
    return () => {
      jexl?.dispose();
      context?.dispose();
      output?.dispose();
    };
  }, []);

  // Restore auto-saved session after editors are initialized
  useEffect(() => {
    if (!jexlEditor || !contextEditor) return;

    const autoSaved = getAutoSavedSession();
    if (autoSaved) {
      // Check if the auto-saved session is recent (within 24 hours)
      const timeSinceLastSave = Date.now() - autoSaved.lastSaved.getTime();
      const hoursAgo = timeSinceLastSave / (1000 * 60 * 60);
      
      if (hoursAgo < 24) {
        jexlEditor.setValue(autoSaved.expression);
        contextEditor.setValue(autoSaved.context);
        console.log('Restored auto-saved session from', autoSaved.lastSaved.toLocaleString());
        
        // Show brief notification that session was restored
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    }
  }, [jexlEditor, contextEditor, getAutoSavedSession]);

  // Debounced evaluation
  const evaluateExpression = useCallback(async (expression: string, context: any) => {
    setIsEvaluating(true);
    setLastError(null);
    setOutputType(null);

    const { result, error } = await evaluateJexl(expression, context);
    
    if (error) {
      setLastError(error);
      outputEditor?.setValue(`Error: ${error}`);
      outputEditor?.updateOptions({ language: 'text' });
    } else {
      const formattedResult = formatResult(result);
      outputEditor?.setValue(formattedResult);
      outputEditor?.updateOptions({ 
        language: typeof result === 'string' ? 'text' : 'json' 
      });
      
      // Determine output type
      const getTypeInfo = (value: any): string => {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return `array[${value.length}]`;
        if (typeof value === 'object') return 'object';
        if (typeof value === 'string') return `string`;
        if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
        if (typeof value === 'boolean') return 'boolean';
        return typeof value;
      };
      
      setOutputType(getTypeInfo(result));
    }
    
    setIsEvaluating(false);
  }, [outputEditor]);

  // Handle manual evaluation
  const handleEvaluate = useCallback(async () => {
    if (!jexlEditor || !contextEditor) return;

    const expression = jexlEditor.getValue();
    const contextText = contextEditor.getValue();

    const { data: contextData, error: contextError } = parseJsonSafely(contextText);
    
    if (contextError) {
      setLastError(`Invalid JSON context: ${contextError}`);
      outputEditor?.setValue(`Error: Invalid JSON context - ${contextError}`);
      outputEditor?.updateOptions({ language: 'text' });
      return;
    }

    await evaluateExpression(expression, contextData);
  }, [jexlEditor, contextEditor, evaluateExpression]);

  // Auto-evaluate when editors change
  useEffect(() => {
    if (!jexlEditor || !contextEditor) return;

    const timeoutId = setTimeout(() => {
      handleEvaluate();
      // Auto-save after evaluation
      setAutoSaveStatus('saving');
      const expression = jexlEditor.getValue();
      const contextText = contextEditor.getValue();
      autoSaveSession(expression, contextText);
      setAutoSaveStatus('saved');
      
      // Clear saved status after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 500); // 500ms debounce

    const jexlDisposable = jexlEditor.onDidChangeModelContent(() => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        handleEvaluate();
        // Auto-save after evaluation
        setAutoSaveStatus('saving');
        const expression = jexlEditor.getValue();
        const contextText = contextEditor.getValue();
        autoSaveSession(expression, contextText);
        setAutoSaveStatus('saved');
        
        // Clear saved status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 500);
    });

    const contextDisposable = contextEditor.onDidChangeModelContent(() => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        handleEvaluate();
        // Auto-save after evaluation
        setAutoSaveStatus('saving');
        const expression = jexlEditor.getValue();
        const contextText = contextEditor.getValue();
        autoSaveSession(expression, contextText);
        setAutoSaveStatus('saved');
        
        // Clear saved status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 500);
      
      // Reset context path when content changes
      setContextPath(null);
    });

    return () => {
      clearTimeout(timeoutId);
      jexlDisposable?.dispose();
      contextDisposable?.dispose();
    };
  }, [jexlEditor, contextEditor, handleEvaluate, autoSaveSession]);

  // Copy result to clipboard
  const copyResult = async () => {
    if (outputEditor) {
      const text = outputEditor.getValue();
      await navigator.clipboard.writeText(text);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    if (jexlEditor) jexlEditor.setValue(defaultExpression);
    if (contextEditor) contextEditor.setValue(JSON.stringify(defaultContext, null, 2));
    setContextPath(null);
  };

  // Handle saving session
  const handleSaveSession = () => {
    setShowSaveDialog(true);
  };

  const handleSaveSessionConfirm = (name: string, description?: string) => {
    if (jexlEditor && contextEditor) {
      const expression = jexlEditor.getValue();
      const context = contextEditor.getValue();
      saveSession(name, expression, context, description);
    }
  };

  // Handle loading session
  const handleLoadSession = (expression: string, context: string) => {
    if (jexlEditor && contextEditor) {
      jexlEditor.setValue(expression);
      contextEditor.setValue(context);
      setContextPath(null); // Clear path when loading new session
    }
  };

  // Handle deleting session
  const handleDeleteSession = (sessionId: string) => {
    console.log('Playground: handleDeleteSession called with:', sessionId);
    deleteSession(sessionId);
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex-none border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                JEXL Playground
              </h1>
              <p className="text-muted-foreground">
                Interactive playground for JEXL Extended expressions
              </p>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href="https://github.com/konnektr-io/jexl-playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SiGithub className="h-3 w-3" />
                  Playground Source
                </a>
                <a
                  href="https://github.com/konnektr-io/jexl-extended"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SiGithub className="h-3 w-3" />
                  JEXL Extended Library
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-save status indicator */}
              {autoSaveStatus === "saving" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Saving...
                </div>
              )}
              {autoSaveStatus === "saved" && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <Check className="h-3 w-3" />
                  Auto-saved
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleEvaluate} disabled={isEvaluating}>
                  {isEvaluating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Evaluate
                </Button>
                <Button onClick={resetToDefaults} variant="outline">
                  <FileText className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Saved Sessions & Examples */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full p-6 overflow-y-auto">
                {/* Saved Sessions */}
                <SavedSessions
                  sessions={sessions}
                  loading={loading}
                  onLoadSession={handleLoadSession}
                  onSaveSession={handleSaveSession}
                  onDeleteSession={handleDeleteSession}
                />

                {/* Examples */}
                <Examples onLoadExample={handleLoadSession} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Editors */}
            <ResizablePanel defaultSize={75}>
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Top Row - Input and Context */}
                <ResizablePanel defaultSize={50}>
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full"
                  >
                    {/* JEXL Input */}
                    <ResizablePanel defaultSize={50}>
                      <div className="h-full flex flex-col">
                        <div className="flex-none p-4 border-b h-[57px]">
                          <h3 className="text-sm font-medium">
                            JEXL Expression
                          </h3>
                        </div>
                        <div
                          className="p-4"
                          style={{ height: "calc(100% - 57px)" }}
                        >
                          <div
                            ref={jexlEditorRef}
                            className="h-full rounded-md border"
                          />
                        </div>
                      </div>
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* Context Input */}
                    <ResizablePanel defaultSize={50}>
                      <div className="h-full flex flex-col">
                        <div className="flex-none p-4 border-b flex items-center justify-between h-[57px]">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">
                              Context (JSON)
                            </h3>
                            {contextPath && (
                              <span className="text-xs text-muted-foreground">
                                • {contextPath}
                              </span>
                            )}
                          </div>
                          {contextPath && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1.5"
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  contextPath
                                );
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div
                          className="p-4"
                          style={{ height: "calc(100% - 57px)" }}
                        >
                          <div
                            ref={contextEditorRef}
                            className="h-full rounded-md border"
                          />
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Bottom Row - Output */}
                <ResizablePanel defaultSize={50}>
                  <div className="h-full flex flex-col">
                    <div className="flex-none p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">Output</h3>
                        {lastError && (
                          <span className="text-xs text-destructive">
                            • Error
                          </span>
                        )}
                        {!lastError && outputType && (
                          <span className="text-xs text-muted-foreground">
                            • {outputType}
                          </span>
                        )}
                      </div>
                      <Button onClick={copyResult} size="sm" variant="ghost">
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <div
                      className="p-4"
                      style={{ height: "calc(100% - 73px)" }}
                    >
                      <div
                        ref={outputEditorRef}
                        className="h-full rounded-md border"
                      />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Save Dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveSessionConfirm}
        currentExpression={jexlEditor?.getValue() || ""}
        currentContext={contextEditor?.getValue() || ""}
      />
    </TooltipProvider>
  );
}
