import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactFlowProvider } from '@xyflow/react';
import { useTheme } from './ThemeContext';
import ConnectionForm from './components/ConnectionForm';
import QueryEditor from './components/QueryEditor';
import PlanStatsBanner from './components/PlanStatsBanner';
import PlanTree from './components/PlanTree';
import DetailPanel from './components/DetailPanel';
import { executeExplain, type ConnectionParams } from './api/queryApi';
import { buildExplainTree, buildAnalyzeTree } from './utils/treeBuilder';
import { resetFragmentColors } from './utils/colorScale';
import type { UnifiedTreeNode } from './types/explainAnalyze';
import type { ExplainAnalyzeResult, PlanStatistics } from './types/explainAnalyze';

type Mode = 'EXPLAIN' | 'EXPLAIN_ANALYZE' | 'EXPLAIN_ANALYZE_VERBOSE';

function App() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [connection, setConnection] = useState<ConnectionParams>({
    host: '127.0.0.1', port: 6667, username: 'root', password: 'root', database: '',
  });
  const [sql, setSql] = useState('SELECT * FROM tb');
  const [mode, setMode] = useState<Mode>('EXPLAIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tree, setTree] = useState<UnifiedTreeNode | null>(null);
  const [isAnalyze, setIsAnalyze] = useState(false);
  const [planStats, setPlanStats] = useState<PlanStatistics | null>(null);
  const [fragmentCount, setFragmentCount] = useState(0);
  const [selectedNode, setSelectedNode] = useState<UnifiedTreeNode | null>(null);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');

  const handleRun = async () => {
    setLoading(true); setError(null); setSelectedNode(null); resetFragmentColors();
    try {
      const res = await executeExplain({ ...connection, sql, mode });
      if (!res.success) { setError(res.error ?? 'Unknown error'); setTree(null); setPlanStats(null); return; }
      const json = JSON.parse(res.planJson!);
      if (mode === 'EXPLAIN') {
        setTree(buildExplainTree(json)); setIsAnalyze(false); setPlanStats(null); setFragmentCount(0);
      } else {
        const result = json as ExplainAnalyzeResult;
        setTree(buildAnalyzeTree(result)); setIsAnalyze(true);
        setPlanStats(result.planStatistics); setFragmentCount(result.fragmentInstancesCount);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error'); setTree(null); setPlanStats(null);
    } finally { setLoading(false); }
  };

  const handleSelectNode = useCallback((node: UnifiedTreeNode) => setSelectedNode(node), []);

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 h-12 flex-shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>
            {t('title')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
          {/* Language */}
          <button
            onClick={toggleLang}
            className="h-8 px-3 text-xs font-medium rounded-full cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--bg-raised)' }}
          >
            {t('lang.toggle')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside
          className="w-[330px] overflow-y-auto flex-shrink-0 flex flex-col"
          style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
        >
          <div className="p-5 space-y-6 flex-1">
            <ConnectionForm connection={connection} onChange={setConnection} />
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <QueryEditor sql={sql} onSqlChange={setSql} mode={mode} onModeChange={setMode} onRun={handleRun} loading={loading} />
          </div>
          <div className="px-5 py-2 text-center" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            IoTDB Profiler v1.0
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {planStats && <PlanStatsBanner stats={planStats} fragmentCount={fragmentCount} />}
          {error && (
            <div className="mx-4 mt-3 px-4 py-2.5 text-[13px] rounded-xl" style={{ background: 'var(--error-bg)', border: '1px solid var(--error)', color: 'var(--error)', fontFamily: 'var(--font-mono)', borderColor: 'rgba(196, 69, 54, 0.2)' }}>
              {error}
            </div>
          )}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1">
              {tree ? (
                <ReactFlowProvider>
                  <PlanTree tree={tree} isAnalyze={isAnalyze} onSelectNode={handleSelectNode} />
                </ReactFlowProvider>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" opacity="0.35">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
                    <circle cx="24" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="24" y1="17" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="16" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="32" cy="30" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="22" y1="25" x2="17.5" y2="28" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="26" y1="25" x2="30.5" y2="28" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <span className="text-[13px]" style={{ fontFamily: 'var(--font-body)' }}>{t('plan.noResult')}</span>
                </div>
              )}
            </div>
            {selectedNode && <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
