import { type Node as FlowNode } from 'reactflow';
import { type Node, type LayoutConfiguration } from '../api/client';

interface LayoutResult {
  x: number;
  y: number;
}

interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Estimate node dimensions based on content
 */
function estimateNodeSize(node: Node): { width: number; height: number } {
  const minWidth = 180;
  const maxWidth = 300;
  const padding = 24; // 12px on each side
  
  // Estimate width based on title length
  const titleLength = node.title.length;
  let width = Math.min(maxWidth, Math.max(minWidth, titleLength * 8 + padding));
  
  // Estimate height
  let height = 60; // Base height
  if (node.description && node.description.length > 0) {
    // Add height for description (rough estimate)
    const descLines = Math.ceil(node.description.length / 30);
    height += Math.min(descLines * 16, 48); // Max 3 lines
  }
  if (node.tags && node.tags.length > 0) {
    height += 28; // Tags row
  }
  height += 20; // "Double-click to edit" text
  
  return { width, height };
}

/**
 * Check if two nodes overlap
 */
function nodesOverlap(a: NodeBounds, b: NodeBounds, padding: number = 20): boolean {
  return !(
    a.x + a.width + padding < b.x ||
    b.x + b.width + padding < a.x ||
    a.y + a.height + padding < b.y ||
    b.y + b.height + padding < a.y
  );
}

/**
 * Adjust positions to eliminate overlaps with minimal displacement
 */
function resolveCollisions(
  positions: Map<string, LayoutResult>,
  nodes: Node[],
  maxIterations: number = 30
): Map<string, LayoutResult> {
  const nodeSizes = new Map<string, { width: number; height: number }>();
  nodes.forEach(node => {
    nodeSizes.set(node.id, estimateNodeSize(node));
  });
  
  const adjustedPositions = new Map(positions);
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasOverlap = false;
    let maxOverlap = 0;
    
    const nodeList = Array.from(adjustedPositions.entries()).map(([id, pos]) => {
      const size = nodeSizes.get(id) || { width: 200, height: 80 };
      return {
        id,
        bounds: {
          x: pos.x - size.width / 2,
          y: pos.y - size.height / 2,
          width: size.width,
          height: size.height,
        },
      };
    });
    
    // Check all pairs for overlaps
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const nodeA = nodeList[i];
        const nodeB = nodeList[j];
        
        if (nodesOverlap(nodeA.bounds, nodeB.bounds, 50)) {
          hasOverlap = true;
          
          // Calculate overlap amount
          const centerA = {
            x: nodeA.bounds.x + nodeA.bounds.width / 2,
            y: nodeA.bounds.y + nodeA.bounds.height / 2,
          };
          const centerB = {
            x: nodeB.bounds.x + nodeB.bounds.width / 2,
            y: nodeB.bounds.y + nodeB.bounds.height / 2,
          };
          
          const dx = centerB.x - centerA.x;
          const dy = centerB.y - centerA.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Calculate minimum safe distance
          const minDistX = (nodeA.bounds.width + nodeB.bounds.width) / 2 + 50;
          const minDistY = (nodeA.bounds.height + nodeB.bounds.height) / 2 + 50;
          const minDist = Math.sqrt(minDistX * minDistX + minDistY * minDistY);
          
          const overlap = Math.max(0, minDist - distance);
          maxOverlap = Math.max(maxOverlap, overlap);
          
          if (overlap > 0) {
            // Push nodes apart proportionally to overlap
            const pushStrength = overlap * 0.5; // Gentle push
            const pushX = (dx / distance) * pushStrength;
            const pushY = (dy / distance) * pushStrength;
            
            const posA = adjustedPositions.get(nodeA.id)!;
            const posB = adjustedPositions.get(nodeB.id)!;
            
            adjustedPositions.set(nodeA.id, {
              x: posA.x - pushX,
              y: posA.y - pushY,
            });
            adjustedPositions.set(nodeB.id, {
              x: posB.x + pushX,
              y: posB.y + pushY,
            });
          }
        }
      }
    }
    
    // Stop if overlaps are resolved or very small
    if (!hasOverlap || maxOverlap < 5) break;
  }
  
  return adjustedPositions;
}

/**
 * Calculate radial layout positions with optimized ordering to minimize crossings
 * Places nodes in concentric circles based on their depth
 */
function calculateRadialLayout(
  nodes: Node[],
  config: LayoutConfiguration
): Map<string, LayoutResult> {
  const positions = new Map<string, LayoutResult>();
  // Use larger defaults to accommodate typical node sizes (200-300px wide)
  const { nodeSpacing = 250, levelSpacing = 300 } = config;

  // Build parent-child relationships
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();
  const rootNodes: string[] = [];

  nodes.forEach(node => {
    if (node.parentId) {
      if (!childrenMap.has(node.parentId)) {
        childrenMap.set(node.parentId, []);
      }
      childrenMap.get(node.parentId)!.push(node.id);
      parentMap.set(node.id, node.parentId);
    } else {
      rootNodes.push(node.id);
    }
  });

  // Calculate depth for each node
  const depths = new Map<string, number>();
  const queue: Array<{ nodeId: string; depth: number }> = rootNodes.map(id => ({ nodeId: id, depth: 0 }));
  
  while (queue.length > 0) {
    const { nodeId, depth } = queue.shift()!;
    depths.set(nodeId, depth);
    
    const children = childrenMap.get(nodeId) || [];
    children.forEach(childId => {
      queue.push({ nodeId: childId, depth: depth + 1 });
    });
  }

  // Group nodes by depth
  const nodesByDepth = new Map<number, string[]>();
  depths.forEach((depth, nodeId) => {
    if (!nodesByDepth.has(depth)) {
      nodesByDepth.set(depth, []);
    }
    nodesByDepth.get(depth)!.push(nodeId);
  });

  // Position nodes in radial layout
  nodesByDepth.forEach((nodesAtDepth, depth) => {
    if (depth === 0) {
      // Center node(s)
      nodesAtDepth.forEach((nodeId, index) => {
        // If multiple root nodes, space them out
        positions.set(nodeId, { 
          x: index * nodeSpacing - ((nodesAtDepth.length - 1) * nodeSpacing) / 2, 
          y: 0 
        });
      });
    } else {
      // Sort nodes to be near their parents to minimize edge crossings
      const sortedNodes = [...nodesAtDepth].sort((a, b) => {
        const parentA = parentMap.get(a);
        const parentB = parentMap.get(b);
        if (!parentA || !parentB) return 0;
        
        const parentPosA = positions.get(parentA);
        const parentPosB = positions.get(parentB);
        if (!parentPosA || !parentPosB) return 0;
        
        // Sort by parent angle
        const angleA = Math.atan2(parentPosA.y, parentPosA.x);
        const angleB = Math.atan2(parentPosB.y, parentPosB.x);
        return angleA - angleB;
      });
      
      const radius = depth * levelSpacing;
      const nodeCount = sortedNodes.length;
      
      // Calculate minimum angle needed to fit a node (assuming ~250px node width)
      const nodeWidth = nodeSpacing * 0.8; // Approximate node width
      const circumference = 2 * Math.PI * radius;
      const minAnglePerNode = (nodeWidth / circumference) * 2 * Math.PI;
      
      // Use the larger of: even distribution or minimum spacing
      const angleStep = Math.max(
        (2 * Math.PI) / nodeCount,
        minAnglePerNode * 1.2 // Add 20% padding
      );
      
      // If nodes would overlap, increase radius
      const adjustedRadius = angleStep < (2 * Math.PI) / nodeCount
        ? (nodeWidth * nodeCount * 1.2) / (2 * Math.PI)
        : radius;
      
      sortedNodes.forEach((nodeId, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const x = adjustedRadius * Math.cos(angle);
        const y = adjustedRadius * Math.sin(angle);
        positions.set(nodeId, { x, y });
      });
    }
  });

  // Resolve any remaining overlaps
  return resolveCollisions(positions, nodes);
}

/**
 * Calculate tree layout positions with optimized child ordering to minimize crossings
 */
function calculateTreeLayout(
  nodes: Node[],
  config: LayoutConfiguration
): Map<string, LayoutResult> {
  const positions = new Map<string, LayoutResult>();
  // Use larger defaults to accommodate typical node sizes (200-300px wide)
  const { nodeSpacing = 250, levelSpacing = 300, treeOrientation = 'TOP_DOWN' } = config;

  // Build parent-child relationships
  const childrenMap = new Map<string, string[]>();
  const rootNodes: string[] = [];

  nodes.forEach(node => {
    if (node.parentId) {
      if (!childrenMap.has(node.parentId)) {
        childrenMap.set(node.parentId, []);
      }
      childrenMap.get(node.parentId)!.push(node.id);
    } else {
      rootNodes.push(node.id);
    }
  });

  // Calculate subtree sizes for better ordering
  const subtreeSizes = new Map<string, number>();
  
  function calculateSubtreeSize(nodeId: string): number {
    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) {
      subtreeSizes.set(nodeId, 1);
      return 1;
    }
    const size = 1 + children.reduce((sum, childId) => sum + calculateSubtreeSize(childId), 0);
    subtreeSizes.set(nodeId, size);
    return size;
  }

  // Calculate sizes for all nodes
  rootNodes.forEach(rootId => calculateSubtreeSize(rootId));

  // Sort children by subtree size to minimize crossings (larger subtrees toward center)
  childrenMap.forEach((children) => {
    children.sort((a, b) => {
      const sizeA = subtreeSizes.get(a) || 1;
      const sizeB = subtreeSizes.get(b) || 1;
      return sizeB - sizeA; // Larger subtrees first
    });
  });

  // Calculate tree layout using DFS
  const isHorizontal = treeOrientation === 'LEFT_RIGHT' || treeOrientation === 'RIGHT_LEFT';
  const isReversed = treeOrientation === 'BOTTOM_UP' || treeOrientation === 'RIGHT_LEFT';
  
  let currentOffset = 0;

  function layoutSubtree(nodeId: string, depth: number): number {
    const children = childrenMap.get(nodeId) || [];
    
    if (children.length === 0) {
      // Leaf node
      const pos = currentOffset;
      currentOffset += nodeSpacing;
      
      const primaryAxis = isReversed ? -depth * levelSpacing : depth * levelSpacing;
      const secondaryAxis = pos;
      
      if (isHorizontal) {
        positions.set(nodeId, { x: primaryAxis, y: secondaryAxis });
      } else {
        positions.set(nodeId, { x: secondaryAxis, y: primaryAxis });
      }
      
      return pos;
    }

    // Layout children first
    const childPositions: number[] = [];
    children.forEach(childId => {
      childPositions.push(layoutSubtree(childId, depth + 1));
    });

    // Position parent at center of children
    const minChild = Math.min(...childPositions);
    const maxChild = Math.max(...childPositions);
    const centerPos = (minChild + maxChild) / 2;

    const primaryAxis = isReversed ? -depth * levelSpacing : depth * levelSpacing;
    
    if (isHorizontal) {
      positions.set(nodeId, { x: primaryAxis, y: centerPos });
    } else {
      positions.set(nodeId, { x: centerPos, y: primaryAxis });
    }

    return centerPos;
  }

  // Layout each root node with spacing between them
  rootNodes.forEach((rootId, index) => {
    if (index > 0) {
      // Add extra spacing between separate trees
      currentOffset += nodeSpacing * 2;
    }
    layoutSubtree(rootId, 0);
  });

  // Resolve any remaining overlaps
  return resolveCollisions(positions, nodes);
}

/**
 * Apply layout to nodes based on configuration
 */
export function applyLayout(
  nodes: Node[],
  layoutConfig?: LayoutConfiguration
): FlowNode[] {
  if (!layoutConfig) {
    // Default: use saved positions or random with better spread
    return nodes.map((node, index) => ({
      id: node.id,
      type: 'editable',
      position: node.position
        ? { x: node.position.x, y: node.position.y }
        : { 
            // Spread nodes in a grid pattern to avoid overlap
            x: (index % 5) * 300, 
            y: Math.floor(index / 5) * 300 
          },
      data: {},
    }));
  }

  const { layoutType } = layoutConfig;
  let positions: Map<string, LayoutResult>;

  switch (layoutType) {
    case 'RADIAL':
      positions = calculateRadialLayout(nodes, layoutConfig);
      break;
    
    case 'TREE':
      positions = calculateTreeLayout(nodes, layoutConfig);
      break;
    
    case 'XY_FIXED':
    case 'XY_HYBRID':
      // Use saved positions, with fallback for nodes without positions
      positions = new Map();
      let gridIndex = 0;
      nodes.forEach(node => {
        if (node.position) {
          positions.set(node.id, { x: node.position.x, y: node.position.y });
        } else if (layoutType === 'XY_HYBRID') {
          // For XY_HYBRID, generate positions for nodes without saved ones
          positions.set(node.id, {
            x: (gridIndex % 5) * 300,
            y: Math.floor(gridIndex / 5) * 300
          });
          gridIndex++;
        }
      });
      break;
    
    case 'AUTO':
    default:
      // Try to use tree layout if there's a hierarchy, otherwise radial
      const hasHierarchy = nodes.some(n => n.parentId);
      positions = hasHierarchy
        ? calculateTreeLayout(nodes, layoutConfig)
        : calculateRadialLayout(nodes, layoutConfig);
      break;
  }

  // Apply positions to nodes with fallback for any missing positions
  let fallbackIndex = 0;
  return nodes.map(node => {
    const pos = positions.get(node.id);
    return {
      id: node.id,
      type: 'editable',
      position: pos
        ? { x: pos.x, y: pos.y }
        : node.position
        ? { x: node.position.x, y: node.position.y }
        : { 
            // Fallback grid pattern
            x: (fallbackIndex % 5) * 300, 
            y: Math.floor(fallbackIndex++ / 5) * 300 
          },
      data: {},
    };
  });
}
