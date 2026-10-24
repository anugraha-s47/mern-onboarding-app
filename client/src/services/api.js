import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', timeout: 15000 });
api.interceptors.request.use(config => { const token = sessionStorage.getItem('record_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export function errorMessage(error) { return error?.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The request timed out. Please retry.' : 'Could not reach the server. Check your connection and try again.'); }
export default api;
