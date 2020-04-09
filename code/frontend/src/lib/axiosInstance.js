import axios from 'axios';
import { baseUrl } from './apiConfig';

const strSessionStorageToken = localStorage.getItem('authToken');
const iAxios = axios.create({
  baseURL: baseUrl,
  headers: {
    Authorization: `Bearer ${strSessionStorageToken}`,
  },
});

export default iAxios;
console.log(baseUrl);
