export interface ExplainPlanNode {
  name: string;
  id: string;
  properties?: Record<string, string | string[]>;
  children?: ExplainPlanNode[];
}
