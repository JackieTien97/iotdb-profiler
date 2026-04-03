import { useTranslation } from 'react-i18next';
import type { UnifiedTreeNode } from '../types/explainAnalyze';
import { formatMemory } from '../utils/colorScale';

interface Props { node: UnifiedTreeNode; onClose: () => void; }

export default function DetailPanel({ node, onClose }: Props) {
  const { t } = useTranslation();
  const isAnalyze = node.cpuTimeMs !== undefined;

  return (
    <div className="w-80 overflow-y-auto flex-shrink-0" style={{ background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}>
      <div className="sticky top-0 px-4 py-3 flex items-center justify-between" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{node.label}</h3>
        <button onClick={onClose} className="cursor-pointer p-1 rounded-md transition-colors" style={{ color: 'var(--text-muted)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <div className="px-4 py-3 space-y-4">
        <Section title={t('node.details')}>
          <Row label="Node Type" value={node.nodeType} />
          <Row label="Plan Node ID" value={node.planNodeId} />
          {node.operatorType && <Row label="Operator Type" value={node.operatorType} />}
        </Section>
        {isAnalyze && (
          <Section title="Metrics">
            <Row label={t('node.cpuTime')} value={`${node.cpuTimeMs!.toFixed(3)} ms`} accent />
            <Row label={t('node.outputRows')} value={String(node.outputRows ?? 0)} />
            <Row label={t('node.memory')} value={formatMemory(node.estimatedMemorySize ?? 0)} />
          </Section>
        )}
        {node.properties && Object.keys(node.properties).length > 0 && (
          <Section title={t('node.properties')}>
            {Object.entries(node.properties).map(([k, v]) => <Row key={k} label={k} value={Array.isArray(v) ? v.join(', ') : String(v)} />)}
          </Section>
        )}
        {node.specifiedInfo && Object.keys(node.specifiedInfo).length > 0 && (
          <Section title={t('node.specifiedInfo')}>
            {Object.entries(node.specifiedInfo).map(([k, v]) => <Row key={k} label={k} value={v} />)}
          </Section>
        )}
        {node.fragmentId && (
          <Section title={t('node.fragment')}>
            <Row label="ID" value={node.fragmentId} />
            <Row label="IP" value={node.fragmentIp ?? ''} />
            <Row label={t('node.region')} value={node.fragmentDataRegion ?? ''} />
            <Row label={t('node.state')} value={node.fragmentState ?? ''} />
            <Row label={t('node.wallTime')} value={`${node.fragmentWallTimeMs ?? 0} ms`} />
          </Section>
        )}
        {node.fragmentQueryStatistics && Object.keys(node.fragmentQueryStatistics).length > 0 && (
          <Section title={t('node.queryStats')}>
            {Object.entries(node.fragmentQueryStatistics).filter(([, v]) => v !== undefined).map(([k, v]) => <Row key={k} label={k} value={String(v)} />)}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{title}</h4>
      <div className="space-y-0.5 rounded-lg p-2" style={{ background: 'var(--bg-raised)' }}>{children}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-2 py-0.5" style={{ fontSize: '11px' }}>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', flexShrink: 0 }}>{label}</span>
      <span className="text-right break-all" style={{ fontFamily: 'var(--font-mono)', color: accent ? 'var(--accent)' : 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}
