import * as monaco from 'monaco-editor';
import { Monaco } from "jexl-extended";
import { getLocation } from 'jsonc-parser';

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

export function createJsonEditor(container: HTMLElement, value: string = '', onOffsetClick?: (offset: number) => void) {
  const editor = monaco.editor.create(container, {
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
  
  // Add click handler for path detection
  if (onOffsetClick) {
    editor.onMouseDown((e) => {
      if (e.target.position) {
        const model = editor.getModel();
        if (model) {
          const offset = model.getOffsetAt(e.target.position);
          onOffsetClick(offset);
        }
      }
    });
  }
  
  return editor;
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

// Get JSON path from offset (adapted from your Vue.js code)
export function getJsonPathFromOffset(jsonString: string, offset: number): string | null {
  try {
    const location = getLocation(jsonString, offset);
    
    if (!location || !location.path) return null;
    
    // Convert path segments to JEXL path
    return location.path.reduce<string>((prevPath, pathSeg, index) => {
      if (typeof pathSeg === 'number') return `${prevPath}[${pathSeg}]`;
      // Check if pathSeg includes special characters (with regex)
      else if (/[`~!@#%^&*()|+\\\-=?;:'.,\s']/g.test(pathSeg)) return `${prevPath}['${pathSeg}']`;
      else if (index === 0) return pathSeg;
      else if (pathSeg.length === 0) return prevPath;
      else return `${prevPath}.${pathSeg}`;
    }, '');
  } catch {
    return null;
  }
}
