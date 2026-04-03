import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { getFragmentBorderColor } from '../../utils/colorScale';

interface FragmentGroupData extends Record<string, unknown> {
  fragmentId: string;
  fragmentIp: string;
  fragmentDataRegion: string;
  fragmentState: string;
  width: number;
  height: number;
}

function FragmentGroupComponent({ data }: NodeProps) {
  const { fragmentId, fragmentIp, fragmentDataRegion, width, height } = data as unknown as FragmentGroupData;
  const borderColor = getFragmentBorderColor(fragmentId);
  const shortId = fragmentId.includes('.') ? fragmentId.split('_').pop() ?? fragmentId : fragmentId;

  return (
    <div style={{ width, height, border: `1.5px dashed ${borderColor}`, borderRadius: 16, background: 'transparent', position: 'relative', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', top: -1, left: 16, transform: 'translateY(-50%)',
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '2px 10px', borderRadius: 8,
        border: `1px solid ${borderColor}`, background: 'var(--bg-surface)',
        pointerEvents: 'auto', boxShadow: 'var(--shadow-sm)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: borderColor.replace(/[\d.]+\)$/, '0.8)'), flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>Fragment {shortId}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{fragmentIp}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Region: {fragmentDataRegion}</span>
      </div>
    </div>
  );
}

export default memo(FragmentGroupComponent);
