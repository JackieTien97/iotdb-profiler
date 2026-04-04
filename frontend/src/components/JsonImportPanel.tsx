import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import Editor from '@monaco-editor/react';

interface Props {
  onVisualize: (jsonText: string) => void;
  loading: boolean;
}

export default function JsonImportPanel({ onVisualize, loading }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [jsonText, setJsonText] = useState('');
  const jsonTextRef = useRef('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((v: string | undefined) => {
    const val = v ?? '';
    setJsonText(val);
    jsonTextRef.current = val;
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setJsonText(text);
      jsonTextRef.current = text;
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const canVisualize = jsonText.trim().length > 0 && !loading;

  return (
    <div className="space-y-3">
      <span className="text-[13px] font-600 block" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', fontWeight: 600 }}>
        {t('jsonImport.title')}
      </span>

      <div className="rounded-xl overflow-hidden" style={{ height: 280, border: '1px solid var(--border)', background: 'var(--bg-input)' }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={jsonText}
          onChange={handleChange}
          options={{
            minimap: { enabled: false }, fontSize: 13, fontFamily: 'var(--font-mono)',
            lineNumbers: 'off', scrollBeyondLastLine: false, wordWrap: 'on',
            padding: { top: 10, bottom: 10 }, overviewRulerBorder: false,
            hideCursorInOverviewRuler: true, overviewRulerLanes: 0,
            renderLineHighlight: 'none', scrollbar: { verticalSliderSize: 4, horizontalSliderSize: 4 },
            glyphMargin: false, folding: false, lineDecorationsWidth: 12,
          }}
          onMount={(editor) => {
            editor.addCommand(2048 | 3, () => onVisualize(jsonTextRef.current));
          }}
        />
      </div>

      {/* Upload file button */}
      <button
        className="w-full py-2 text-[12px] font-medium rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2"
        style={{
          fontFamily: 'var(--font-body)',
          background: 'var(--bg-raised)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {t('jsonImport.uploadFile')}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        hidden
        onChange={handleFileUpload}
      />

      {/* Visualize button */}
      <button
        className="w-full py-2.5 text-[13px] font-semibold rounded-xl cursor-pointer transition-all duration-150 disabled:opacity-40"
        style={{
          fontFamily: 'var(--font-sans)',
          background: loading ? 'var(--bg-raised)' : 'var(--accent)',
          color: loading ? 'var(--text-muted)' : 'var(--accent-text)',
          border: 'none',
          boxShadow: loading ? 'none' : 'var(--shadow-sm)',
        }}
        onClick={() => onVisualize(jsonText)}
        disabled={!canVisualize}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ animation: 'spin-slow 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            {t('jsonImport.visualizing')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {t('jsonImport.visualize')}
          </span>
        )}
      </button>

      <div className="text-center" style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Ctrl + Enter
      </div>
    </div>
  );
}
