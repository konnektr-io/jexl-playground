import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// Configure Monaco Editor workers for Vite
(self as any).MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === 'json') {
			return new jsonWorker();
		}
		return new editorWorker();
	}
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
