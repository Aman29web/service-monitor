import axios from 'axios';

const BASE = import.meta.env.VITE_MASTER_URL || 'http://localhost:4000';

const api = axios.create({ baseURL: BASE });

export const fetchNodes = () => api.get('/api/nodes').then(r => r.data.nodes);
export const fetchNode  = (id) => api.get(`/api/nodes/${id}`).then(r => r.data.node);