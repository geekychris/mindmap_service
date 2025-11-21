import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { mindMapApi, type MindMap } from '../api/client';

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [newMapDescription, setNewMapDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: mindMapsData, isLoading } = useQuery({
    queryKey: ['mindmaps'],
    queryFn: () => mindMapApi.getAll({ size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; ownerId: string }) =>
      mindMapApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] });
      setShowCreateModal(false);
      setNewMapName('');
      setNewMapDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mindMapApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindmaps'] });
    },
  });

  const handleCreate = () => {
    if (!newMapName.trim()) return;
    
    // For demo, use first available user or hardcoded ID
    const ownerId = mindMapsData?.content[0]?.owner.id || 'demo-user';
    createMutation.mutate({
      name: newMapName,
      description: newMapDescription || undefined,
      ownerId,
    });
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mind maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Mind Maps</h1>
          <p className="mt-2 text-sm text-gray-600">
            {mindMapsData?.totalElements || 0} mind map(s)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Mind Map
        </button>
      </div>

      {/* Mind Maps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mindMapsData?.content.map((mindMap: MindMap) => (
          <div
            key={mindMap.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
          >
            <Link to={`/mindmap/${mindMap.id}`} className="block p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {mindMap.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {mindMap.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {mindMap.owner.displayName}
                </div>
                <span>{new Date(mindMap.createdAt).toLocaleDateString()}</span>
              </div>
              {mindMap.layoutConfiguration && (
                <div className="mt-2 inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                  {mindMap.layoutConfiguration.layoutType}
                </div>
              )}
            </Link>
            <div className="px-6 py-3 bg-gray-50 border-t flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm('Are you sure you want to delete this mind map?')) {
                    deleteMutation.mutate(mindMap.id);
                  }
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {mindMapsData?.content.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No mind maps</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new mind map.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Create Mind Map
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Mind Map</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter mind map name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewMapName('');
                  setNewMapDescription('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="px-4 py-2 rounded-md transition bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
