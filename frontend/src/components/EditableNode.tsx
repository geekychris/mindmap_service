import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface NodeData {
  label: string;
  title: string;
  description?: string;
  color?: string;
  tags?: string[];
  onEdit: (id: string, data: { title: string; description?: string; color?: string }) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function EditableNode({ id, data }: NodeProps<NodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description || '');

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSave = useCallback(() => {
    if (title.trim()) {
      data.onEdit(id, { title, description: description || undefined, color: data.color });
      setIsEditing(false);
    }
  }, [id, title, description, data]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTitle(data.title);
      setDescription(data.description || '');
    }
  }, [handleSave, data]);

  const handleClick = useCallback(() => {
    data.onSelect(id);
  }, [id, data]);

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        background: data.color || '#fff',
        border: `2px solid ${data.isSelected ? '#4f46e5' : (data.color || '#ddd')}`,
        borderRadius: '8px',
        padding: '12px',
        minWidth: '180px',
        maxWidth: '300px',
        boxShadow: data.isSelected ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
        cursor: isEditing ? 'text' : 'pointer',
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      {isEditing ? (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm font-semibold"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
            rows={3}
            placeholder="Description..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
            >
              Save (Ctrl+Enter)
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setTitle(data.title);
                setDescription(data.description || '');
              }}
              className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
            >
              Cancel (Esc)
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="font-semibold text-sm mb-1" style={{ color: '#1a1a1a' }}>
            {data.title}
          </div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1 line-clamp-3">
              {data.description}
            </div>
          )}
          {data.tags && data.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {data.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2">
            Double-click to edit
          </div>
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(EditableNode);
