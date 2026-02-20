export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  DATASETS: '/api/datasets',
  DATASET: (id: number | string) => `/api/dataset/${id}`,
  DATASET_CREATE: '/api/dataset',
} as const;

export const FORM_FIELDS = {
  DATASET_NAME: 'dataset_name',
  FILE: 'file',
} as const;

export const ACCEPTED_FILE_EXT = '.xlsx';
