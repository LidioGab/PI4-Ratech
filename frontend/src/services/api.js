import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080'
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Helpers para endereços (opcionais)
export const addresses = {
  list: (userId) => api.get(`/users/${userId}/enderecos`),
  create: (userId, body) => api.post(`/users/${userId}/enderecos`, body),
  setDefault: (userId, enderecoId) => api.post(`/users/${userId}/enderecos/${enderecoId}/default`),
  update: (userId, enderecoId, body) => api.put(`/users/${userId}/enderecos/${enderecoId}`, body),
  remove: (userId, enderecoId) => api.delete(`/users/${userId}/enderecos/${enderecoId}`),
};
