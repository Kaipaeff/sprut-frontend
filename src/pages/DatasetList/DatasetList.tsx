import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DatasetListSkeleton } from './DatasetList.skeleton';
import { fetchDatasets } from '../../api/datasets';
import { getErrorMessage } from '../../utils/errorHandler';
import { ROUTES } from '../../constants/routes';
import type { DatasetItem } from '../../types/api';
import styles from './DatasetList.module.css';

export function DatasetList() {
  const [list, setList] = useState<DatasetItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchDatasets()
      .then((data) => {
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            getErrorMessage(err, {
              defaultMessage: 'Ошибка загрузки списка датасетов',
              networkErrorMessage: 'Ошибка загрузки списка. Проверьте подключение к серверу',
            })
          );
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <section aria-labelledby="datasets-title">
        <h1 id="datasets-title" className={styles.title}>Датасеты</h1>
        <div className={styles.error} role="alert">{error}</div>
      </section>
    );
  }

  if (list === null) {
    return <DatasetListSkeleton />;
  }

  const safeList = Array.isArray(list) ? list : [];

  return (
    <section aria-labelledby="datasets-title">
      <h1 id="datasets-title" className={styles.title}>Датасеты</h1>
      <section className={styles.card} aria-label="Список датасетов">
        {safeList.length === 0 ? (
          <p className={styles.empty}>Нет датасетов. Загрузите первый.</p>
        ) : (
          <ul className={styles.list}>
            {safeList.map((item) => (
              <li key={item.id} className={styles.row}>
                <div className={styles.info}>
                  <span className={styles.id}>ID: {item.id}</span>
                  <span className={styles.separator} aria-hidden />
                  <span className={styles.name}>{item.name}</span>
                </div>
                <Link to={ROUTES.CHART(item.id)} className={styles.btn}>
                  Открыть
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
