import { useTranslation } from 'react-i18next';
import type { PlanStatistics } from '../types/explainAnalyze';

interface Props { stats: PlanStatistics; fragmentCount: number; }

export default function PlanStatsBanner({ stats, fragmentCount }: Props) {
  const { t } = useTranslation();
  const items = [
    { key: 'analyzeCost', label: t('plan.analyzeCost'), value: stats.analyzeCostMs },
    { key: 'fetchPartition', label: t('plan.fetchPartition'), value: stats.fetchPartitionCostMs },
    { key: 'fetchSchema', label: t('plan.fetchSchema'), value: stats.fetchSchemaCostMs },
    { key: 'logicalPlan', label: t('plan.logicalPlan'), value: stats.logicalPlanCostMs },
    { key: 'optimization', label: t('plan.logicalOptimization'), value: stats.logicalOptimizationCostMs },
    { key: 'distribution', label: t('plan.distributionPlan'), value: stats.distributionPlanCostMs },
    { key: 'dispatch', label: t('plan.dispatchCost'), value: stats.dispatchCostMs },
  ];
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const colors = ['#C96442', '#3D8B5E', '#D4A843', '#5B8AC4', '#8B6BB5', '#3DA8A0', '#CC7A3C'];

  return (
    <div className="mx-3 mt-3 rounded-xl px-4 py-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>{t('plan.statistics')}</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{total.toFixed(2)}ms</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            {fragmentCount} fragments
          </span>
        </div>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--bg-raised)' }}>
        {items.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          if (pct < 0.5) return null;
          return <div key={item.key} style={{ width: `${pct}%`, backgroundColor: colors[i], opacity: 0.85 }} title={`${item.label}: ${item.value.toFixed(3)}ms`} />;
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item, i) => (
          <div key={item.key} className="flex items-center gap-1.5" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: colors[i], opacity: 0.85 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ color: 'var(--text-muted)' }}>{item.value.toFixed(2)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
