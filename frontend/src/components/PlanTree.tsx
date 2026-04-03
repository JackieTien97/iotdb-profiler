import { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
} from '@xyflow/react';
import type { UnifiedTreeNode } from '../types/explainAnalyze';
import { computeLayout } from '../utils/layoutEngine';
import { computeMaxCpuTime } from '../utils/treeBuilder';
import OperatorNodeComponent from './nodes/OperatorNode';
import FragmentGroupComponent from './nodes/FragmentGroup';

interface Props {
  tree: UnifiedTreeNode;
  isAnalyze: boolean;
  onSelectNode: (node: UnifiedTreeNode) => void;
}

const nodeTypes = {
  operatorNode: OperatorNodeComponent,
  fragmentGroup: FragmentGroupComponent,
};

function PlanTreeInner({ tree, isAnalyze, onSelectNode }: Props) {
  const maxCpuTimeMs = useMemo(() => computeMaxCpuTime(tree), [tree]);
  const { fitView } = useReactFlow();

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    const layout = computeLayout(tree, isAnalyze);
    const nodesWithHandlers = layout.nodes.map((n) => {
      if (n.type === 'fragmentGroup') {
        return n; // fragment groups don't need handlers
      }
      return {
        ...n,
        data: {
          treeNode: n.data,
          maxCpuTimeMs,
          onSelect: onSelectNode,
        },
      };
    });
    return { nodes: nodesWithHandlers, edges: layout.edges };
  }, [tree, isAnalyze, maxCpuTimeMs, onSelectNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [layoutNodes, layoutEdges, setNodes, setEdges, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const treeNode = (node.data as { treeNode: UnifiedTreeNode }).treeNode;
      onSelectNode(treeNode);
    },
    [onSelectNode]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Controls position="bottom-right" />
      <MiniMap
        position="bottom-left"
        pannable
        zoomable
        style={{ width: 150, height: 100 }}
      />
      <Background variant={BackgroundVariant.Dots} gap={20} size={0.8} color="var(--flow-bg-dots)" />
    </ReactFlow>
  );
}

export default function PlanTree(props: Props) {
  return <PlanTreeInner {...props} />;
}
