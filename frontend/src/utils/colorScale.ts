export function cpuTimeColor(cpuTimeMs: number, maxCpuTimeMs: number): string {
  if (maxCpuTimeMs <= 0) return 'var(--bg-raised)';
  const ratio = Math.min(cpuTimeMs / maxCpuTimeMs, 1);
  // Warm: terracotta (0) -> amber (0.5) -> red-orange (1)
  if (ratio <= 0.5) {
    const t = ratio * 2;
    const r = Math.round(61 + t * (212 - 61));
    const g = Math.round(139 + t * (168 - 139));
    const b = Math.round(94 + t * (67 - 94));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = (ratio - 0.5) * 2;
    const r = Math.round(212 + t * (201 - 212));
    const g = Math.round(168 - t * (168 - 100));
    const b = Math.round(67 + t * (66 - 67));
    return `rgb(${r},${g},${b})`;
  }
}

export function cpuBarWidth(cpuTimeMs: number, maxCpuTimeMs: number): number {
  if (maxCpuTimeMs <= 0) return 0;
  return Math.min((cpuTimeMs / maxCpuTimeMs) * 100, 100);
}

export function formatMemory(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Warm fragment palettes
const FRAGMENT_COLORS = [
  'rgba(201, 100, 66, 0.05)',
  'rgba(61, 139, 94, 0.05)',
  'rgba(212, 168, 67, 0.05)',
  'rgba(91, 138, 196, 0.05)',
  'rgba(139, 107, 181, 0.05)',
  'rgba(61, 168, 160, 0.05)',
  'rgba(204, 122, 60, 0.05)',
  'rgba(180, 87, 58, 0.05)',
];

const FRAGMENT_BORDER_COLORS = [
  'rgba(201, 100, 66, 0.25)',
  'rgba(61, 139, 94, 0.25)',
  'rgba(212, 168, 67, 0.25)',
  'rgba(91, 138, 196, 0.25)',
  'rgba(139, 107, 181, 0.25)',
  'rgba(61, 168, 160, 0.25)',
  'rgba(204, 122, 60, 0.25)',
  'rgba(180, 87, 58, 0.25)',
];

const fragmentColorMap = new Map<string, number>();

export function getFragmentColor(fragmentId: string): string {
  if (!fragmentColorMap.has(fragmentId)) fragmentColorMap.set(fragmentId, fragmentColorMap.size % FRAGMENT_COLORS.length);
  return FRAGMENT_COLORS[fragmentColorMap.get(fragmentId)!];
}

export function getFragmentBorderColor(fragmentId: string): string {
  if (!fragmentColorMap.has(fragmentId)) fragmentColorMap.set(fragmentId, fragmentColorMap.size % FRAGMENT_BORDER_COLORS.length);
  return FRAGMENT_BORDER_COLORS[fragmentColorMap.get(fragmentId)!];
}

export function resetFragmentColors() { fragmentColorMap.clear(); }
