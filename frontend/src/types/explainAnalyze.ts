export interface PlanStatistics {
  analyzeCostMs: number;
  fetchPartitionCostMs: number;
  fetchSchemaCostMs: number;
  logicalPlanCostMs: number;
  logicalOptimizationCostMs: number;
  distributionPlanCostMs: number;
  dispatchCostMs: number;
}

export interface QueryStatistics {
  [key: string]: number | undefined;
}

export interface OperatorNode {
  planNodeId: string;
  nodeType: string;
  operatorType: string;
  cpuTimeMs: number;
  outputRows: number;
  hasNextCalledCount: number;
  nextCalledCount: number;
  estimatedMemorySize: number;
  specifiedInfo?: Record<string, string>;
  children?: OperatorNode[];
}

export interface FragmentInstance {
  id: string;
  ip: string;
  dataRegion: string;
  state: string;
  totalWallTimeMs: number;
  initDataQuerySourceCostMs: number;
  seqFileUnclosed: number;
  seqFileClosed: number;
  unseqFileUnclosed: number;
  unseqFileClosed: number;
  readyQueuedTimeMs: number;
  blockQueuedTimeMs: number;
  queryStatistics: QueryStatistics;
  operators: OperatorNode;
}

export interface ExplainAnalyzeResult {
  planStatistics: PlanStatistics;
  fragmentInstancesCount: number;
  fragmentInstances: FragmentInstance[];
}

export interface UnifiedTreeNode {
  id: string;
  label: string;
  planNodeId: string;
  nodeType: string;
  operatorType?: string;
  cpuTimeMs?: number;
  outputRows?: number;
  estimatedMemorySize?: number;
  properties?: Record<string, string | string[]>;
  specifiedInfo?: Record<string, string>;
  fragmentId?: string;
  fragmentIp?: string;
  fragmentDataRegion?: string;
  fragmentState?: string;
  fragmentWallTimeMs?: number;
  fragmentQueryStatistics?: QueryStatistics;
  isExchangeLink?: boolean;
  children: UnifiedTreeNode[];
}
