import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on OpenAPI spec
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

export interface LayoutConfiguration {
  layoutType: 'AUTO' | 'XY_FIXED' | 'XY_HYBRID' | 'RADIAL' | 'TREE';
  zoom: number;
  centerX?: number;
  centerY?: number;
  treeOrientation?: 'TOP_DOWN' | 'BOTTOM_UP' | 'LEFT_RIGHT' | 'RIGHT_LEFT';
  nodeSpacing: number;
  levelSpacing: number;
}

export interface Participant {
  id: string;
  user: User;
  permission: 'VIEW' | 'EDIT' | 'ADMIN';
  addedAt: string;
  addedBy: string;
}

export interface MindMap {
  id: string;
  name: string;
  description?: string;
  owner: User;
  participants: Participant[];
  layoutConfiguration?: LayoutConfiguration;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Node {
  id: string;
  mindmapId: string;
  parentId?: string;
  title: string;
  description?: string;
  color?: string;
  tags: string[];
  externalLinks: ExternalLink[];
  position?: NodePosition;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface NodePosition {
  x: number;
  y: number;
  isFixed: boolean;
}

export interface ExternalLink {
  url: string;
  title?: string;
  description?: string;
}

export interface NodeLink {
  id: string;
  mindmapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  linkType: string;
  label?: string;
  createdAt: string;
  createdBy: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// API functions
export const mindMapApi = {
  getAll: async (params?: { owner?: string; page?: number; size?: number; sort?: string }) => {
    const response = await apiClient.get<PageResponse<MindMap>>('/mindmaps', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<MindMap>(`/mindmaps/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; ownerId: string }) => {
    const response = await apiClient.post<MindMap>('/mindmaps', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; description?: string; layoutConfiguration?: Partial<LayoutConfiguration> }) => {
    const response = await apiClient.put<MindMap>(`/mindmaps/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/mindmaps/${id}`);
  },

  addParticipant: async (mindmapId: string, data: { userId: string; permission?: 'VIEW' | 'EDIT' | 'ADMIN' }) => {
    const response = await apiClient.post<Participant>(`/mindmaps/${mindmapId}/participants`, data);
    return response.data;
  },

  removeParticipant: async (mindmapId: string, participantId: string) => {
    await apiClient.delete(`/mindmaps/${mindmapId}/participants/${participantId}`);
  },
};

export const nodeApi = {
  getAll: async (mindmapId: string) => {
    const response = await apiClient.get<Node[]>(`/mindmaps/${mindmapId}/nodes`);
    return response.data;
  },
  
  create: async (mindmapId: string, data: { title: string; description?: string; color?: string; parentId?: string; position?: { x: number; y: number } }) => {
    const response = await apiClient.post<Node>(`/mindmaps/${mindmapId}/nodes`, data);
    return response.data;
  },
  
  update: async (mindmapId: string, nodeId: string, data: { title?: string; description?: string; color?: string; parentId?: string; position?: { x: number; y: number } }) => {
    const response = await apiClient.put<Node>(`/mindmaps/${mindmapId}/nodes/${nodeId}`, data);
    return response.data;
  },
  
  delete: async (mindmapId: string, nodeId: string) => {
    await apiClient.delete(`/mindmaps/${mindmapId}/nodes/${nodeId}`);
  },
};

export const nodeLinkApi = {
  getAll: async (mindmapId: string) => {
    const response = await apiClient.get<NodeLink[]>(`/mindmaps/${mindmapId}/links`);
    return response.data;
  },
  
  create: async (mindmapId: string, data: { sourceNodeId: string; targetNodeId: string; linkType: string; label?: string }) => {
    const response = await apiClient.post<NodeLink>(`/mindmaps/${mindmapId}/links`, data);
    return response.data;
  },
  
  update: async (mindmapId: string, linkId: string, data: { linkType?: string; label?: string }) => {
    const response = await apiClient.put<NodeLink>(`/mindmaps/${mindmapId}/links/${linkId}`, data);
    return response.data;
  },
  
  delete: async (mindmapId: string, linkId: string) => {
    await apiClient.delete(`/mindmaps/${mindmapId}/links/${linkId}`);
  },
};
