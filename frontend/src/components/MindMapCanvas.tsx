import React, { useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
  type Node as FlowNode,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { type Node, type NodeLink, type LayoutConfiguration } from '../api/client';
import EditableNode from './EditableNode';
import { applyLayout } from '../utils/layouts';

interface MindMapCanvasProps {
  nodes: Node[];
  links?: NodeLink[];
  layoutConfig?: LayoutConfiguration;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeEdit: (nodeId: string, data: { title: string; description?: string; color?: string }) => void;
  onNodeDelete: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string, edgeLabel: string) => void;
}

export default function MindMapCanvas({ nodes, links = [], layoutConfig, selectedNodeId, onNodeSelect, onNodeEdit, onNodeDelete, onEdgeClick }: MindMapCanvasProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ editable: EditableNode }), []);

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // Apply layout algorithm to get positions
    const layoutedNodes = applyLayout(nodes, layoutConfig);

    // Convert backend nodes to ReactFlow nodes with editable type
    const converted: FlowNode[] = layoutedNodes.map((layoutNode) => {
      const node = nodes.find(n => n.id === layoutNode.id)!;
      return {
        id: layoutNode.id,
        type: 'editable',
        position: layoutNode.position,
        data: {
          label: node.title,
          title: node.title,
          description: node.description,
          color: node.color,
          tags: node.tags,
          isSelected: node.id === selectedNodeId,
          onEdit: onNodeEdit,
          onDelete: onNodeDelete,
          onSelect: onNodeSelect,
        },
      };
    });

    // Create edges from parent-child relationships (solid lines)
    const parentEdges: Edge[] = nodes
      .filter((node) => node.parentId)
      .map((node) => ({
        id: `parent-${node.parentId}-${node.id}`,
        source: node.parentId!,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          strokeWidth: 2,
          stroke: '#4f46e5',
        },
        label: 'child',
      }));

    // Create edges from named links (dashed lines)
    const namedEdges: Edge[] = (links || []).map((link) => ({
      id: `link-${link.id}`,
      source: link.sourceNodeId,
      target: link.targetNodeId,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        strokeWidth: 2,
        stroke: '#10b981',
        strokeDasharray: '5,5',
      },
      label: link.label || link.linkType,
      labelStyle: { fill: '#10b981', fontWeight: 500 },
      labelBgStyle: { fill: '#fff' },
    }));

    const edges = [...parentEdges, ...namedEdges];

    setFlowNodes(converted);
    setFlowEdges(edges);
  }, [nodes, links, layoutConfig, selectedNodeId, setFlowNodes, setFlowEdges]);

  const handlePaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  const handleEdgeClickInternal = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    if (onEdgeClick) {
      onEdgeClick(edge.id, edge.label as string || '');
    }
  }, [onEdgeClick]);

  const [hasInitialized, setHasInitialized] = React.useState(false);
  const onInit = useCallback(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
    }
  }, [hasInitialized]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={handlePaneClick}
        onEdgeClick={handleEdgeClickInternal}
        onInit={onInit}
        fitView={!hasInitialized}
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
