import { API_BASE_URL } from '../constants/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': '1',
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Convenience methods
export const apiGet = (endpoint: string, options: RequestInit = {}) => 
  apiFetch(endpoint, { ...options, method: 'GET' });

export const apiPost = (endpoint: string, data: any, options: RequestInit = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiPut = (endpoint: string, data: any, options: RequestInit = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const apiDelete = (endpoint: string, options: RequestInit = {}) =>
  apiFetch(endpoint, { ...options, method: 'DELETE' }); 