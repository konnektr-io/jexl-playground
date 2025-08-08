import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
import { Copy, Play, RefreshCw, FileText } from 'lucide-react';

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

// Example expressions - Real jexl-extended functions
const examples = [
  {
    title: "String Manipulation",
    expression: '"Hello World"|uppercase|split(" ")|join("-")',
    description: "Transform string to uppercase and replace spaces with dashes"
  },
  {
    title: "Array Operations", 
    expression: 'users|filter(\'value.active\')|map(\'value.name\')|sort()',
    description: "Filter active users and get their names sorted"
  },
  {
    title: "Numeric Aggregations",
    expression: 'products|map(\'value.price\')|sum',
    description: "Calculate total price of all products"
  },
  {
    title: "Complex Filtering",
    expression: 'users|filter(\'value.department == "Engineering" && value.active\')|length',
    description: "Count active users in Engineering department"
  },
  {
    title: "String Functions",
    expression: '"hello world"|substringBefore(" ")|uppercase',
    description: "Extract text before space and convert to uppercase"
  },
  {
    title: "Date Operations",
    expression: 'now()|dateTimeAdd("days", 7)|dateTimeFormat("yyyy-MM-dd")',
    description: "Add 7 days to current date and format"
  },
  {
    title: "Object Transformation",
    expression: '[["name","John"],["age",30]]|toObject',
    description: "Convert array of key-value pairs to object"
  },
  {
    title: "Base64 Encoding",
    expression: '"hello world"|base64Encode|base64Decode',
    description: "Encode to base64 and decode back"
  },
  {
    title: "Boolean Logic",
    expression: 'users|any(\'value.age > 30\')',
    description: "Check if any user is older than 30"
  },
  {
    title: "Number Formatting",
    expression: '16325.62|formatNumber("0,0.000")',
    description: "Format number with thousands separator and decimals"
  },
  {
    title: "Conditional Case",
    expression: 'users[0].department|case("Engineering","Tech","Sales","Business","Other")',
    description: "Use case statement for conditional values"
  },
  {
    title: "Array Reduce",
    expression: 'users|reduce("accumulator + value.age", 0)',
    description: "Sum all user ages using reduce"
  }
];

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

  // Initialize Monaco editors
  useEffect(() => {
    if (!jexlEditorRef.current || !contextEditorRef.current || !outputEditorRef.current) return;

    // Create editors
    const jexl = createJexlEditor(jexlEditorRef.current, defaultExpression);
    const context = createJsonEditor(
      contextEditorRef.current, 
      JSON.stringify(defaultContext, null, 2),
      (offset) => {
        const path = getJsonPathFromOffset(JSON.stringify(defaultContext, null, 2), offset);
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
    }, 500); // 500ms debounce

    const jexlDisposable = jexlEditor.onDidChangeModelContent(() => {
      clearTimeout(timeoutId);
      setTimeout(handleEvaluate, 500);
    });

    const contextDisposable = contextEditor.onDidChangeModelContent(() => {
      clearTimeout(timeoutId);
      setTimeout(handleEvaluate, 500);
    });

    return () => {
      clearTimeout(timeoutId);
      jexlDisposable?.dispose();
      contextDisposable?.dispose();
    };
  }, [jexlEditor, contextEditor, handleEvaluate]);

  // Load example
  const loadExample = (example: typeof examples[0]) => {
    if (jexlEditor) {
      jexlEditor.setValue(example.expression);
    }
  };

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
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-none border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">JEXL Playground</h1>
            <p className="text-muted-foreground">
              Interactive playground for JEXL Extended expressions
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleEvaluate} 
              disabled={isEvaluating}
            >
              {isEvaluating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Evaluate
            </Button>
            <Button onClick={resetToDefaults} variant="outline">
              <FileText className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Examples */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Examples</h3>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <Card key={index} className="group hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">{example.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline"
                              onClick={() => loadExample(example)}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Load this example</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <pre className="text-xs bg-muted p-3 rounded text-muted-foreground font-mono whitespace-pre-wrap break-all">
                        {example.expression}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Editors */}
          <ResizablePanel defaultSize={75}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              {/* Top Row - Input and Context */}
              <ResizablePanel defaultSize={50}>
                <ResizablePanelGroup direction="horizontal" className="h-full">
                  {/* JEXL Input */}
                  <ResizablePanel defaultSize={50}>
                    <div className="h-full flex flex-col">
                      <div className="flex-none p-4 border-b">
                        <h3 className="text-sm font-medium">JEXL Expression</h3>
                      </div>
                      <div className="p-4" style={{ height: 'calc(100% - 57px)' }}>
                        <div ref={jexlEditorRef} className="h-full rounded-md border" />
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle />

                  {/* Context Input */}
                  <ResizablePanel defaultSize={50}>
                    <div className="h-full flex flex-col">
                      <div className="flex-none p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">Context (JSON)</h3>
                          {contextPath && (
                            <span className="text-xs text-muted-foreground">• {contextPath}</span>
                          )}
                        </div>
                        {contextPath && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={async () => {
                              await navigator.clipboard.writeText(contextPath);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="p-4" style={{ height: 'calc(100% - 57px)' }}>
                        <div ref={contextEditorRef} className="h-full rounded-md border" />
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
                        <span className="text-xs text-destructive">• Error</span>
                      )}
                      {!lastError && outputType && (
                        <span className="text-xs text-muted-foreground">• {outputType}</span>
                      )}
                    </div>
                    <Button onClick={copyResult} size="sm" variant="ghost">
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-4" style={{ height: 'calc(100% - 73px)' }}>
                    <div ref={outputEditorRef} className="h-full rounded-md border" />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
}
