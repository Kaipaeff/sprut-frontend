export const ROUTES = {
  HOME: '/',
  DATASETS: '/datasets',
  CHART: (id: number | string) => `/chart/${id}`,
  DATASET_EDIT: (id: number | string) => `/dataset/${id}/edit`,
} as const;
