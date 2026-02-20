import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

/** В dev без VITE_API_URL запросы идут на тот же origin — прокси Vite переправляет /api на localhost:8000 (обход CORS). */
const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '' : API_BASE_URL);

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});
