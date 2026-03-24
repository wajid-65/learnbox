import axios from 'axios';

const api = axios.create({
  baseURL: '/api',   // same-origin — no CORS needed
  withCredentials: true,
});


export default api;
