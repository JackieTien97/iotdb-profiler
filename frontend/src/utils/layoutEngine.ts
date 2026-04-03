import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { UnifiedTreeNode } from '../types/explainAnalyze';

const NODE_WIDTH = 280;
const NODE_HEIGHT_SIMPLE = 80;
const NODE_HEIGHT_ANALYZE = 160;
const FRAGMENT_PADDING = 24;
const FRAGMENT_GAP = 12; // minimum gap between fragment boxes

export function computeLayout(
  root: UnifiedTreeNode,
  isAnalyze: boolean
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    // In analyze mode, increase spacing so fragment boxes don't overlap
    ranksep: isAnalyze ? FRAGMENT_PADDING * 2 + FRAGMENT_GAP + 40 : 80,
    nodesep: isAnalyze ? FRAGMENT_PADDING * 2 + FRAGMENT_GAP : 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const nodeHeight = isAnalyze ? NODE_HEIGHT_ANALYZE : NODE_HEIGHT_SIMPLE;

  function addToGraph(node: UnifiedTreeNode) {
    g.setNode(node.id, { width: NODE_WIDTH, height: nodeHeight });
    for (const child of node.children) {
      g.setEdge(node.id, child.id);
      addToGraph(child);
    }
  }

  addToGraph(root);
  dagre.layout(g);

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Track positions per fragment for bounding box computation
  const fragmentBounds = new Map<
    string,
    {
      minX: number; minY: number; maxX: number; maxY: number;
      fragmentIp: string; fragmentDataRegion: string; fragmentState: string;
    }
  >();

  function collect(node: UnifiedTreeNode) {
    const pos = g.node(node.id);
    const x = pos.x - NODE_WIDTH / 2;
    const y = pos.y - nodeHeight / 2;

    nodes.push({
      id: node.id,
      type: 'operatorNode',
      position: { x, y },
      data: node,
      zIndex: 10,
    });

    // Accumulate bounding box per fragment (only in analyze mode)
    if (isAnalyze && node.fragmentId) {
      const fid = node.fragmentId;
      const bounds = fragmentBounds.get(fid);
      if (bounds) {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x + NODE_WIDTH);
        bounds.maxY = Math.max(bounds.maxY, y + nodeHeight);
      } else {
        fragmentBounds.set(fid, {
          minX: x,
          minY: y,
          maxX: x + NODE_WIDTH,
          maxY: y + nodeHeight,
          fragmentIp: node.fragmentIp ?? '',
          fragmentDataRegion: node.fragmentDataRegion ?? '',
          fragmentState: node.fragmentState ?? '',
        });
      }
    }

    for (const child of node.children) {
      edges.push({
        id: `${node.id}->${child.id}`,
        source: node.id,
        target: child.id,
        animated: child.isExchangeLink ?? false,
        style: child.isExchangeLink
          ? { strokeDasharray: '6,3', stroke: 'var(--flow-edge-exchange)' }
          : { stroke: 'var(--flow-edge)' },
        zIndex: 5,
      });
      collect(child);
    }
  }

  collect(root);

  // Create fragment group nodes with overlap resolution
  if (isAnalyze) {
    // Build padded rectangles
    const groups: {
      fid: string; x: number; y: number; w: number; h: number;
      fragmentIp: string; fragmentDataRegion: string; fragmentState: string;
    }[] = [];

    for (const [fid, bounds] of fragmentBounds) {
      groups.push({
        fid,
        x: bounds.minX - FRAGMENT_PADDING,
        y: bounds.minY - FRAGMENT_PADDING,
        w: bounds.maxX - bounds.minX + FRAGMENT_PADDING * 2,
        h: bounds.maxY - bounds.minY + FRAGMENT_PADDING * 2,
        fragmentIp: bounds.fragmentIp,
        fragmentDataRegion: bounds.fragmentDataRegion,
        fragmentState: bounds.fragmentState,
      });
    }

    // Resolve overlaps by shrinking padding on overlapping edges
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        resolveOverlap(groups[i], groups[j]);
      }
    }

    for (const g of groups) {
      nodes.push({
        id: `fragment-group-${g.fid}`,
        type: 'fragmentGroup',
        position: { x: g.x, y: g.y },
        data: {
          fragmentId: g.fid,
          fragmentIp: g.fragmentIp,
          fragmentDataRegion: g.fragmentDataRegion,
          fragmentState: g.fragmentState,
          width: g.w,
          height: g.h,
        },
        zIndex: 0,
        selectable: false,
        draggable: false,
      });
    }
  }

  return { nodes, edges };
}

// Shrink overlapping fragment boxes so they don't overlap
function resolveOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);

  if (overlapX <= 0 || overlapY <= 0) return; // no overlap

  // Shrink along the axis with smaller overlap to minimize visual disruption
  if (overlapX <= overlapY) {
    // Horizontal overlap — shrink horizontally
    const half = (overlapX + FRAGMENT_GAP) / 2;
    if (a.x < b.x) {
      // a is left, b is right
      a.w -= half;
      b.x += half;
      b.w -= half;
    } else {
      b.w -= half;
      a.x += half;
      a.w -= half;
    }
  } else {
    // Vertical overlap — shrink vertically
    const half = (overlapY + FRAGMENT_GAP) / 2;
    if (a.y < b.y) {
      // a is above, b is below
      a.h -= half;
      b.y += half;
      b.h -= half;
    } else {
      b.h -= half;
      a.y += half;
      a.h -= half;
    }
  }
}
