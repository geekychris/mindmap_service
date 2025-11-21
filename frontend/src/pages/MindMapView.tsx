import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { mindMapApi, nodeApi, nodeLinkApi, type Node } from '../api/client';
import MindMapCanvas from '../components/MindMapCanvas';

export default function MindMapView() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUserId, setShareUserId] = useState('');
  const [sharePermission, setSharePermission] = useState<'VIEW' | 'EDIT' | 'ADMIN'>('EDIT');
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeDescription, setNodeDescription] = useState('');
  const [nodeColor, setNodeColor] = useState('#ffffff');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkType, setLinkType] = useState('');
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [linkCreationMode, setLinkCreationMode] = useState(false);
  const [editingEdge, setEditingEdge] = useState<{ id: string; type: 'parent' | 'named'; label: string } | null>(null);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [selectedLayoutType, setSelectedLayoutType] = useState<'AUTO' | 'XY_FIXED' | 'XY_HYBRID' | 'RADIAL' | 'TREE'>('AUTO');
  const [selectedTreeOrientation, setSelectedTreeOrientation] = useState<'TOP_DOWN' | 'BOTTOM_UP' | 'LEFT_RIGHT' | 'RIGHT_LEFT'>('TOP_DOWN');

  const { data: mindMap, isLoading } = useQuery({
    queryKey: ['mindmap', id],
    queryFn: () => mindMapApi.getById(id!),
    enabled: !!id,
  });

  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ['nodes', id],
    queryFn: () => nodeApi.getAll(id!),
    enabled: !!id,
  });

  const { data: links = [] } = useQuery({
    queryKey: ['links', id],
    queryFn: () => nodeLinkApi.getAll(id!),
    enabled: !!id,
  });

  const addParticipantMutation = useMutation({
    mutationFn: (data: { userId: string; permission: 'VIEW' | 'EDIT' | 'ADMIN' }) =>
      mindMapApi.addParticipant(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindmap', id] });
      setShowShareModal(false);
      setShareUserId('');
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (participantId: string) =>
      mindMapApi.removeParticipant(id!, participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindmap', id] });
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; color?: string; parentId?: string; position?: { x: number; y: number } }) =>
      nodeApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes', id] });
      setSelectedNodeId(null);
      closeNodeModal();
    },
  });

  const updateNodeMutation = useMutation({
    mutationFn: ({ nodeId, data }: { nodeId: string; data: { title?: string; description?: string; color?: string } }) =>
      nodeApi.update(id!, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes', id] });
      closeNodeModal();
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: (nodeId: string) => nodeApi.delete(id!, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes', id] });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: (data: { sourceNodeId: string; targetNodeId: string; linkType: string; label?: string }) =>
      nodeLinkApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', id] });
      setShowLinkModal(false);
      setLinkLabel('');
      setLinkType('');
      setTargetNodeId(null);
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: ({ linkId, data }: { linkId: string; data: { linkType?: string; label?: string } }) =>
      nodeLinkApi.update(id!, linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', id] });
      setEditingEdge(null);
    },
  });

  const handleShare = () => {
    if (!shareUserId.trim()) return;
    addParticipantMutation.mutate({
      userId: shareUserId,
      permission: sharePermission,
    });
  };

  const openNodeModal = (node?: Node) => {
    if (node) {
      setEditingNode(node);
      setNodeTitle(node.title);
      setNodeDescription(node.description || '');
      setNodeColor(node.color || '#ffffff');
    } else {
      setEditingNode(null);
      setNodeTitle('');
      setNodeDescription('');
      setNodeColor('#ffffff');
    }
    setShowNodeModal(true);
  };

  const closeNodeModal = () => {
    setShowNodeModal(false);
    setEditingNode(null);
    setNodeTitle('');
    setNodeDescription('');
    setNodeColor('#ffffff');
  };

  const handleSaveNode = () => {
    if (!nodeTitle.trim()) return;

    if (editingNode) {
      updateNodeMutation.mutate({
        nodeId: editingNode.id,
        data: {
          title: nodeTitle,
          description: nodeDescription || undefined,
          color: nodeColor,
        },
      });
    } else {
      createNodeMutation.mutate({
        title: nodeTitle,
        description: nodeDescription || undefined,
        color: nodeColor,
        parentId: selectedNodeId || undefined,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
      });
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNodeMutation.mutate(nodeId);
    }
  };

  const handleCreateLink = () => {
    if (!selectedNodeId || !targetNodeId || !linkType.trim()) return;
    
    createLinkMutation.mutate({
      sourceNodeId: selectedNodeId,
      targetNodeId: targetNodeId,
      linkType: linkType,
      label: linkLabel || undefined,
    });
  };

  // Canvas handlers wrapped in useCallback to prevent infinite loops
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    if (linkCreationMode && nodeId && selectedNodeId && nodeId !== selectedNodeId) {
      // Second node selected in link creation mode
      setTargetNodeId(nodeId);
      setLinkCreationMode(false);
      setShowLinkModal(true);
    } else {
      setSelectedNodeId(nodeId);
    }
  }, [linkCreationMode, selectedNodeId]);

  const handleNodeEdit = useCallback((nodeId: string, data: { title: string; description?: string; color?: string }) => {
    updateNodeMutation.mutate({ nodeId, data });
  }, [updateNodeMutation]);

  const handleNodeDeleteFromCanvas = useCallback((nodeId: string) => {
    if (confirm('Delete this node?')) {
      deleteNodeMutation.mutate(nodeId);
    }
  }, [deleteNodeMutation]);

  const handleEdgeClick = useCallback((edgeId: string, edgeLabel: string) => {
    // Determine if this is a parent-child edge or named link
    if (edgeId.startsWith('parent-')) {
      setEditingEdge({ id: edgeId, type: 'parent', label: edgeLabel });
      setLinkLabel(edgeLabel || '');
    } else if (edgeId.startsWith('link-')) {
      const linkId = edgeId.replace('link-', '');
      const link = links.find(l => l.id === linkId);
      setEditingEdge({ id: edgeId, type: 'named', label: edgeLabel });
      setLinkLabel(link?.label || '');
      setLinkType(link?.linkType || '');
    }
  }, [links]);

  const handleSaveEdge = () => {
    if (!editingEdge) return;

    if (editingEdge.type === 'parent') {
      // For parent-child edges, we don't support editing the label yet
      // The label "child" is hardcoded. We could update this later.
      setEditingEdge(null);
    } else if (editingEdge.type === 'named') {
      // Update named link
      const linkId = editingEdge.id.replace('link-', '');
      updateLinkMutation.mutate({
        linkId,
        data: {
          linkType: linkType || undefined,
          label: linkLabel || undefined,
        },
      });
    }
  };

  const handleUpdateLayout = async () => {
    if (!mindMap) return;
    
    try {
      await mindMapApi.update(id!, {
        layoutConfiguration: {
          layoutType: selectedLayoutType,
          treeOrientation: selectedLayoutType === 'TREE' ? selectedTreeOrientation : undefined,
          zoom: 1.0,
          nodeSpacing: 250,
          levelSpacing: 300,
        },
      });
      
      // Refresh mind map and clear node positions to trigger relayout
      queryClient.invalidateQueries({ queryKey: ['mindmap', id] });
      await handleResetLayout();
      setShowLayoutModal(false);
    } catch (error) {
      console.error('Failed to update layout:', error);
      alert('Failed to update layout. Please try again.');
    }
  };

  const handleResetLayout = async () => {
    if (!confirm('Reset all node positions? This will recalculate the layout based on the current layout type.')) {
      return;
    }
    
    // Clear positions for all nodes by updating them
    const updates = nodes.map(node => 
      nodeApi.update(id!, node.id, { position: undefined })
    );
    
    try {
      await Promise.all(updates);
      // Refresh nodes to trigger layout recalculation
      queryClient.invalidateQueries({ queryKey: ['nodes', id] });
    } catch (error) {
      console.error('Failed to reset layout:', error);
      alert('Failed to reset layout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mind map...</p>
        </div>
      </div>
    );
  }

  if (!mindMap) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600">Mind map not found</p>
          <Link to="/dashboard" className="mt-4 text-indigo-600 hover:text-indigo-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{mindMap.name}</h1>
            {mindMap.description && (
              <p className="text-sm text-gray-500">{mindMap.description}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {selectedNodeId && (
            <span style={{ fontSize: '13px', color: '#6b7280', marginRight: '8px' }}>
              Node selected
            </span>
          )}
          <button
            onClick={() => openNodeModal()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            + Add Node {selectedNodeId ? '(as child)' : ''}
          </button>
          {selectedNodeId && (
            <button
              onClick={() => setLinkCreationMode(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: linkCreationMode ? '#059669' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {linkCreationMode ? 'Select target node...' : '+ Create Link'}
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Share
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-gray-600">Owner:</span>
              <span className="ml-2 font-medium">{mindMap.owner.displayName}</span>
            </div>
            {mindMap.layoutConfiguration && (
              <div>
                <span className="text-gray-600">Layout:</span>
                <button
                  onClick={() => {
                    setSelectedLayoutType(mindMap.layoutConfiguration?.layoutType || 'AUTO');
                    setSelectedTreeOrientation(mindMap.layoutConfiguration?.treeOrientation || 'TOP_DOWN');
                    setShowLayoutModal(true);
                  }}
                  className="ml-2 font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  {mindMap.layoutConfiguration.layoutType}
                </button>
              </div>
            )}
            <div>
              <span className="text-gray-600">Participants:</span>
              <span className="ml-2 font-medium">{mindMap.participants.length}</span>
            </div>
          </div>
          <button
            onClick={() => handleResetLayout()}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            🔄 Reset Layout
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-gray-100">
        {nodesLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading nodes...</p>
            </div>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Nodes Yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Start adding nodes to visualize your mind map
              </p>
            </div>
          </div>
        ) : (
          <MindMapCanvas 
            nodes={nodes} 
            links={links}
            layoutConfig={mindMap.layoutConfiguration}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            onNodeEdit={handleNodeEdit}
            onNodeDelete={handleNodeDeleteFromCanvas}
            onEdgeClick={handleEdgeClick}
          />
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Share Mind Map</h2>
            
            {/* Current Participants */}
            {mindMap.participants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Participants</h3>
                <div className="space-y-2">
                  {mindMap.participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <p className="text-sm font-medium">{p.user.displayName}</p>
                        <p className="text-xs text-gray-500">{p.permission}</p>
                      </div>
                      <button
                        onClick={() => removeParticipantMutation.mutate(p.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Participant */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={shareUserId}
                  onChange={(e) => setShareUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission
                </label>
                <select
                  value={sharePermission}
                  onChange={(e) => setSharePermission(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="VIEW">View</option>
                  <option value="EDIT">Edit</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareUserId('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleShare}
                disabled={!shareUserId.trim() || addParticipantMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addParticipantMutation.isPending ? 'Adding...' : 'Add Participant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Edit Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              {editingNode ? 'Edit Node' : 'Create Node'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={nodeTitle}
                  onChange={(e) => setNodeTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter node title"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={nodeDescription}
                  onChange={(e) => setNodeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter description"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={nodeColor}
                  onChange={(e) => setNodeColor(e.target.value)}
                  className="w-20 h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <div>
                {editingNode && (
                  <button
                    onClick={() => handleDeleteNode(editingNode.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={closeNodeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNode}
                  disabled={!nodeTitle.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNode ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create Link</h2>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-gray-600">From: <span className="font-semibold">{nodes.find(n => n.id === selectedNodeId)?.title || 'Selected Node'}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Node *
                </label>
                <select
                  value={targetNodeId || ''}
                  onChange={(e) => setTargetNodeId(e.target.value === '' ? null : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select target node...</option>
                  {nodes
                    .filter(node => node.id !== selectedNodeId)
                    .map(node => (
                      <option key={node.id} value={node.id}>
                        {node.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Type *
                </label>
                <input
                  type="text"
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., relates-to, depends-on, blocks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Link description"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkLabel('');
                  setLinkType('');
                  setTargetNodeId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!targetNodeId || !linkType.trim() || createLinkMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLinkMutation.isPending ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Edge Modal */}
      {editingEdge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">
              Edit {editingEdge.type === 'parent' ? 'Parent-Child' : 'Named'} Link
            </h2>
            
            {editingEdge.type === 'parent' ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    Parent-child relationships use a fixed "child" label. To change the parent of a node, you would need to edit the child node properties.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Type *
                  </label>
                  <input
                    type="text"
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., relates-to, depends-on, blocks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Link description"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditingEdge(null);
                  setLinkLabel('');
                  setLinkType('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {editingEdge.type === 'named' && (
                <button
                  onClick={handleSaveEdge}
                  disabled={!linkType.trim() || updateLinkMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLinkMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Layout Configuration Modal */}
      {showLayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Change Layout</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout Type
                </label>
                <select
                  value={selectedLayoutType}
                  onChange={(e) => setSelectedLayoutType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="AUTO">Auto (Smart)</option>
                  <option value="TREE">Tree (Hierarchical)</option>
                  <option value="RADIAL">Radial (Circular)</option>
                  <option value="XY_HYBRID">Manual (Hybrid)</option>
                  <option value="XY_FIXED">Manual (Fixed)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedLayoutType === 'AUTO' && 'Automatically chooses best layout based on structure'}
                  {selectedLayoutType === 'TREE' && 'Hierarchical tree layout with customizable orientation'}
                  {selectedLayoutType === 'RADIAL' && 'Nodes arranged in concentric circles from center'}
                  {selectedLayoutType === 'XY_HYBRID' && 'Uses saved positions with fallback'}
                  {selectedLayoutType === 'XY_FIXED' && 'Only uses explicitly saved positions'}
                </p>
              </div>

              {selectedLayoutType === 'TREE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tree Orientation
                  </label>
                  <select
                    value={selectedTreeOrientation}
                    onChange={(e) => setSelectedTreeOrientation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TOP_DOWN">Top to Bottom</option>
                    <option value="BOTTOM_UP">Bottom to Top</option>
                    <option value="LEFT_RIGHT">Left to Right</option>
                    <option value="RIGHT_LEFT">Right to Left</option>
                  </select>
                </div>
              )}

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-gray-700">
                  ⚠️ Changing layout will reset all node positions
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowLayoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLayout}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Apply Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
