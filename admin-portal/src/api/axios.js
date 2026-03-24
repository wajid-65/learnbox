import axios from 'axios';

const api = axios.create({
  baseURL: 'https://learnbox-ype6.onrender.com/api',
  withCredentials: true,
});


export default api;
