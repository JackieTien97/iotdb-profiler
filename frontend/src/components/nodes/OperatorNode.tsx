import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import type { UnifiedTreeNode } from '../../types/explainAnalyze';
import { cpuTimeColor, cpuBarWidth, formatMemory, getFragmentColor, getFragmentBorderColor } from '../../utils/colorScale';

interface OperatorNodeData extends Record<string, unknown> {
  treeNode: UnifiedTreeNode;
  maxCpuTimeMs: number;
  onSelect: (node: UnifiedTreeNode) => void;
}

function OperatorNodeComponent({ data }: NodeProps) {
  const { t } = useTranslation();
  const { treeNode: node, maxCpuTimeMs, onSelect } = data as unknown as OperatorNodeData;
  const isAnalyze = node.cpuTimeMs !== undefined;
  const bgColor = node.fragmentId ? getFragmentColor(node.fragmentId) : 'var(--bg-surface)';
  const borderColor = node.fragmentId ? getFragmentBorderColor(node.fragmentId) : 'var(--border)';

  return (
    <div
      className="rounded-xl cursor-pointer transition-all duration-150"
      style={{
        width: 260,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        boxShadow: 'var(--shadow-md)',
      }}
      onClick={() => onSelect(node)}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !rounded-full" style={{ background: 'var(--node-handle)', border: '2px solid var(--bg-surface)' }} />

      {/* Header */}
      <div className="px-3 py-1.5 rounded-t-xl" style={{
        background: isAnalyze ? cpuTimeColor(node.cpuTimeMs!, maxCpuTimeMs) : 'var(--bg-raised)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span className="text-[11px] font-semibold" style={{
          fontFamily: 'var(--font-mono)',
          color: isAnalyze && node.cpuTimeMs! > maxCpuTimeMs * 0.4 ? '#fff' : 'var(--text-primary)',
        }}>
          {node.label}
        </span>
      </div>

      {/* Metrics */}
      {isAnalyze && (
        <div className="px-3 py-2 space-y-1">
          <MetricRow label={t('node.cpuTime')} value={`${node.cpuTimeMs!.toFixed(3)}ms`} accent />
          <MetricRow label={t('node.outputRows')} value={String(node.outputRows?.toLocaleString())} />
          <MetricRow label={t('node.memory')} value={formatMemory(node.estimatedMemorySize ?? 0)} />
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
            <div className="h-full rounded-full" style={{
              width: `${cpuBarWidth(node.cpuTimeMs!, maxCpuTimeMs)}%`,
              background: cpuTimeColor(node.cpuTimeMs!, maxCpuTimeMs),
            }} />
          </div>
        </div>
      )}

      {/* Properties preview for EXPLAIN mode */}
      {!isAnalyze && node.properties && (
        <div className="px-3 py-2">
          {Object.entries(node.properties).slice(0, 3).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-1" style={{ fontSize: '10px' }}>
              <span className="truncate" style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span className="truncate max-w-[140px]" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {Array.isArray(v) ? v.join(', ') : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fragment badge */}
      {node.fragmentDataRegion && isAnalyze && (
        <div className="px-3 pb-1.5 flex items-center gap-1.5" style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)', opacity: 0.6 }} />
          <span>{node.fragmentIp}</span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span>{t('node.region')}: {node.fragmentDataRegion}</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !rounded-full" style={{ background: 'var(--node-handle)', border: '2px solid var(--bg-surface)' }} />
    </div>
  );
}

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between" style={{ fontSize: '10px' }}>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{label}</span>
      <span style={{ color: accent ? 'var(--accent)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: accent ? 500 : 400 }}>{value}</span>
    </div>
  );
}

export default memo(OperatorNodeComponent);
