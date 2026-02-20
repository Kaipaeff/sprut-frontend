import type { DatasetItem, DatasetDetail } from '../types/api';
import { API_ENDPOINTS } from '../constants/api';
import { api } from './client';

export async function fetchDatasets(): Promise<DatasetItem[]> {
  const { data } = await api.get<DatasetItem[] | { datasets?: DatasetItem[] }>(API_ENDPOINTS.DATASETS);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as { datasets?: DatasetItem[] }).datasets)) {
    return (data as { datasets: DatasetItem[] }).datasets;
  }
  return [];
}

export async function fetchDataset(id: number): Promise<DatasetDetail> {
  const { data } = await api.get<DatasetDetail>(API_ENDPOINTS.DATASET(id));
  return data;
}

export async function createDataset(formData: FormData): Promise<{ id: number }> {
  const { data } = await api.post<{ id: number; message: string }>(API_ENDPOINTS.DATASET_CREATE, formData, {
    headers: { 'Content-Type': false as unknown as string },
  });
  return { id: data.id };
}

export async function updateDataset(id: number, formData: FormData): Promise<void> {
  await api.put(API_ENDPOINTS.DATASET(id), formData, {
    headers: { 'Content-Type': false as unknown as string },
  });
}
