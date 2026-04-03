import type { ExplainPlanNode } from '../types/explain';
import type {
  ExplainAnalyzeResult,
  FragmentInstance,
  OperatorNode,
  UnifiedTreeNode,
} from '../types/explainAnalyze';

let nodeCounter = 0;

function uniqueId(prefix: string): string {
  return `${prefix}_${nodeCounter++}`;
}

export function buildExplainTree(node: ExplainPlanNode): UnifiedTreeNode {
  nodeCounter = 0;
  return convertExplainNode(node);
}

function convertExplainNode(node: ExplainPlanNode): UnifiedTreeNode {
  const nodeType = node.name.replace(/-\d+$/, '');
  return {
    id: uniqueId(node.id),
    label: node.name,
    planNodeId: node.id,
    nodeType,
    properties: node.properties,
    children: (node.children ?? []).map(convertExplainNode),
  };
}

export function buildAnalyzeTree(result: ExplainAnalyzeResult): UnifiedTreeNode {
  nodeCounter = 0;

  // Build lookup: DownStreamPlanNodeId -> FragmentInstance
  const downstreamMap = new Map<string, FragmentInstance>();
  for (const fragment of result.fragmentInstances) {
    const root = fragment.operators;
    const downstream = root.specifiedInfo?.DownStreamPlanNodeId;
    if (downstream) {
      downstreamMap.set(downstream, fragment);
    }
  }

  // Find coordinator fragment (the one whose IdentitySinkNode is not referenced by any other fragment)
  // Typically the one with dataRegion = "virtual_data_region"
  const referencedDownstreams = new Set(downstreamMap.keys());
  let coordinator = result.fragmentInstances.find(
    (f) => !referencedDownstreams.has(f.operators.planNodeId)
  );
  if (!coordinator) {
    coordinator = result.fragmentInstances.find(
      (f) => f.dataRegion === 'virtual_data_region'
    );
  }
  if (!coordinator) {
    coordinator = result.fragmentInstances[0];
  }

  return convertOperator(coordinator.operators, coordinator, downstreamMap);
}

function convertOperator(
  op: OperatorNode,
  fragment: FragmentInstance,
  downstreamMap: Map<string, FragmentInstance>
): UnifiedTreeNode {
  const node: UnifiedTreeNode = {
    id: uniqueId(op.planNodeId),
    label: op.nodeType,
    planNodeId: op.planNodeId,
    nodeType: op.nodeType,
    operatorType: op.operatorType,
    cpuTimeMs: op.cpuTimeMs,
    outputRows: op.outputRows,
    estimatedMemorySize: op.estimatedMemorySize,
    specifiedInfo: op.specifiedInfo,
    fragmentId: fragment.id,
    fragmentIp: fragment.ip,
    fragmentDataRegion: fragment.dataRegion,
    fragmentState: fragment.state,
    fragmentWallTimeMs: fragment.totalWallTimeMs,
    fragmentQueryStatistics: fragment.queryStatistics,
    children: [],
  };

  if (op.nodeType === 'ExchangeNode') {
    // Look up which worker fragment feeds into this exchange
    const workerFragment = downstreamMap.get(op.planNodeId);
    if (workerFragment) {
      const workerRoot = workerFragment.operators;
      // Skip the worker's IdentitySinkNode, graft its children
      for (const child of workerRoot.children ?? []) {
        const childNode = convertOperator(child, workerFragment, downstreamMap);
        childNode.isExchangeLink = true;
        node.children.push(childNode);
      }
      return node;
    }
  }

  // Normal case: recurse children
  for (const child of op.children ?? []) {
    node.children.push(convertOperator(child, fragment, downstreamMap));
  }

  return node;
}

export function computeMaxCpuTime(node: UnifiedTreeNode): number {
  let max = node.cpuTimeMs ?? 0;
  for (const child of node.children) {
    max = Math.max(max, computeMaxCpuTime(child));
  }
  return max;
}
