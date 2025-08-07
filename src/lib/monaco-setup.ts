import * as monaco from 'monaco-editor';
import jexl, { Monaco } from 'jexl-extended';

// Create Monaco editor instances
export function createJexlEditor(container: HTMLElement, value: string = ''): monaco.editor.IStandaloneCodeEditor {
  // Use the built-in createJexlEditor function from jexl-extended
  return Monaco.createJexlEditor(monaco, container, {
    value,
    theme: 'vs', // Light theme to match shadcn styling
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    suggest: {
      showWords: false,
      showSnippets: false,
    },
  });
}

export function createJsonEditor(container: HTMLElement, value: string = '') {
  return monaco.editor.create(container, {
    value,
    language: 'json',
    theme: 'vs', // Light theme to match shadcn styling
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    formatOnPaste: true,
    formatOnType: true,
  });
}

export function createReadOnlyEditor(container: HTMLElement, value: string = '', language: string = 'json') {
  return monaco.editor.create(container, {
    value,
    language,
    theme: 'vs', // Light theme to match shadcn styling
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    readOnly: true,
  });
}

// Evaluate JEXL expression safely
export async function evaluateJexl(expression: string, context: any): Promise<{ result: any; error: string | null }> {
  try {
    // Use type assertion to access jexl methods
    const result = await (jexl as any).eval(expression, context);
    return { result, error: null };
  } catch (error) {
    return { 
      result: null, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Parse JSON safely
export function parseJsonSafely(jsonString: string): { data: any; error: string | null } {
  try {
    const data = JSON.parse(jsonString);
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

// Format result for display
export function formatResult(result: any): string {
  if (result === null) return 'null';
  if (result === undefined) return 'undefined';
  if (typeof result === 'string') return result;
  if (typeof result === 'number' || typeof result === 'boolean') return String(result);
  
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
}
