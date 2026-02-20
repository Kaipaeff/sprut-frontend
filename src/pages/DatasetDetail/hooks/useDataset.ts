import { useEffect, useState } from 'react';
import { fetchDataset } from '../../../api/datasets';
import { getErrorMessage } from '../../../utils/errorHandler';
import { DATASET_ERROR_MESSAGES } from '../../../constants/errorMessages';
import type { DatasetDetail } from '../../../types/api';

export function useDataset(id: string | undefined) {
  const [data, setData] = useState<DatasetDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    setData(null);
    fetchDataset(Number(id))
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, DATASET_ERROR_MESSAGES));
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  return { data, error };
}
