export const API_BASE_URL = 'http://localhost:8080';

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/user/login`,
    LOGOUT: `${API_BASE_URL}/user/logout`,
  },
  
  // User management endpoints
  USER: {
    LIST: `${API_BASE_URL}/user/list`,
    CREATE: `${API_BASE_URL}/user/create`,
    UPDATE: (id: string) => `${API_BASE_URL}/user/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/user/delete/${id}`,
    PROFILE: `${API_BASE_URL}/user/profile`,
  },
  
  // Company endpoints
  COMPANY: {
    LIST: `${API_BASE_URL}/company/list`,
    LIST_BY_OFFICER: (username: string) => `${API_BASE_URL}/company/list/${username}`,
    CREATE: `${API_BASE_URL}/company/create`,
    UPDATE: (id: string) => `${API_BASE_URL}/company/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/company/delete/${id}`,
    TEMP: {
      LIST: `${API_BASE_URL}/company/temp/list`,
      UPDATE: `${API_BASE_URL}/company/temp/update`,
      APPROVE: (id: string) => `${API_BASE_URL}/company/temp/approve/${id}`,
      REJECT: (id: string) => `${API_BASE_URL}/company/temp/reject/${id}`,
    }
  },

  // Calendar/Event endpoints
  EVENT: {
    LIST: `${API_BASE_URL}/event/list`,
    CREATE: `${API_BASE_URL}/event/create`,
    UPDATE: (id: string) => `${API_BASE_URL}/event/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/event/delete/${id}`,
    GET_BY_DATE: (date: string) => `${API_BASE_URL}/event/date/${date}`,
    GET_BY_TYPE: (type: 'notification' | 'target') => `${API_BASE_URL}/event/type/${type}`,
  }
}; 