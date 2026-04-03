import { useTranslation } from 'react-i18next';
import { useTheme } from '../ThemeContext';
import Editor from '@monaco-editor/react';

interface Props {
  sql: string;
  onSqlChange: (sql: string) => void;
  mode: 'EXPLAIN' | 'EXPLAIN_ANALYZE' | 'EXPLAIN_ANALYZE_VERBOSE';
  onModeChange: (mode: 'EXPLAIN' | 'EXPLAIN_ANALYZE' | 'EXPLAIN_ANALYZE_VERBOSE') => void;
  onRun: () => void;
  loading: boolean;
}

export default function QueryEditor({ sql, onSqlChange, mode, onModeChange, onRun, loading }: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const modes = [
    { value: 'EXPLAIN' as const, short: 'Plan' },
    { value: 'EXPLAIN_ANALYZE' as const, short: 'Analyze' },
    { value: 'EXPLAIN_ANALYZE_VERBOSE' as const, short: 'Verbose' },
  ];

  return (
    <div className="space-y-3">
      <span className="text-[13px] font-600 block" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', fontWeight: 600 }}>
        {t('query.title')}
      </span>

      <div className="rounded-xl overflow-hidden" style={{ height: 140, border: '1px solid var(--border)', background: 'var(--bg-input)' }}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={sql}
          onChange={(v) => onSqlChange(v ?? '')}
          options={{
            minimap: { enabled: false }, fontSize: 13, fontFamily: 'var(--font-mono)',
            lineNumbers: 'off', scrollBeyondLastLine: false, wordWrap: 'on',
            padding: { top: 10, bottom: 10 }, overviewRulerBorder: false,
            hideCursorInOverviewRuler: true, overviewRulerLanes: 0,
            renderLineHighlight: 'none', scrollbar: { verticalSliderSize: 4, horizontalSliderSize: 4 },
            glyphMargin: false, folding: false, lineDecorationsWidth: 12,
          }}
          onMount={(editor) => { editor.addCommand(2048 | 3, () => onRun()); }}
        />
      </div>

      {/* Mode selector pills */}
      <div>
        <label className="block mb-1.5" style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
          {t('query.mode')}
        </label>
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          {modes.map((m) => (
            <button
              key={m.value}
              className="flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-all duration-150 cursor-pointer"
              style={{
                fontFamily: 'var(--font-body)',
                background: mode === m.value ? 'var(--accent-soft)' : 'transparent',
                color: mode === m.value ? 'var(--accent)' : 'var(--text-muted)',
                border: mode === m.value ? '1px solid var(--border-accent)' : '1px solid transparent',
                fontWeight: mode === m.value ? 600 : 400,
              }}
              onClick={() => onModeChange(m.value)}
            >
              {m.short}
            </button>
          ))}
        </div>
      </div>

      {/* Run button */}
      <button
        className="w-full py-2.5 text-[13px] font-semibold rounded-xl cursor-pointer transition-all duration-150 disabled:opacity-40"
        style={{
          fontFamily: 'var(--font-sans)',
          background: loading ? 'var(--bg-raised)' : 'var(--accent)',
          color: loading ? 'var(--text-muted)' : 'var(--accent-text)',
          border: 'none',
          boxShadow: loading ? 'none' : 'var(--shadow-sm)',
        }}
        onClick={onRun}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ animation: 'spin-slow 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            {t('query.running')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
            {t('query.run')}
          </span>
        )}
      </button>

      <div className="text-center" style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        Ctrl + Enter
      </div>
    </div>
  );
}
