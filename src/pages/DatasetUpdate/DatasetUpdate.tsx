import { useState, useEffect, type SyntheticEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchDataset, updateDataset } from '../../api/datasets';
import { getErrorMessage } from '../../utils/errorHandler';
import { ROUTES } from '../../constants/routes';
import { FORM_FIELDS, ACCEPTED_FILE_EXT } from '../../constants/api';
import { DATASET_ERROR_MESSAGES, FILE_VALIDATION } from '../../constants/errorMessages';
import { DatasetUpdateSkeleton } from './DatasetUpdate.skeleton';
import styles from './DatasetUpdate.module.css';

export function DatasetUpdate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadingName(true);
    fetchDataset(Number(id))
      .then((data) => {
        if (!cancelled) setName(data.name);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(err, {
              ...DATASET_ERROR_MESSAGES,
              defaultMessage: 'Не удалось загрузить датасет',
            })
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingName(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    if (!name.trim()) {
      setError('Введите название датасета');
      return;
    }
    if (!file) {
      setError('Выберите новый файл .xlsx');
      return;
    }
    if (!file.name.toLowerCase().endsWith(ACCEPTED_FILE_EXT)) {
      setError(FILE_VALIDATION.WRONG_FORMAT);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append(FORM_FIELDS.DATASET_NAME, name.trim());
      formData.append(FORM_FIELDS.FILE, file);
      await updateDataset(Number(id), formData);
      navigate(ROUTES.CHART(id!));
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, {
          defaultMessage: 'Ошибка обновления',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return (
      <section>
        <Link to={ROUTES.HOME} className={styles.back}>← Назад</Link>
        <div className={styles.error} role="alert">{loadError}</div>
      </section>
    );
  }

  if (loadingName) {
    return <DatasetUpdateSkeleton />;
  }

  return (
    <section aria-labelledby="update-title">
      <Link to={id ? ROUTES.CHART(id) : ROUTES.HOME} className={styles.back}>← Назад</Link>
      <h1 id="update-title" className={styles.title}>Редактировать датасет</h1>
      <article className={styles.card}>
        {error && <div className={styles.error} role="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">
              Название
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название датасета"
              autoComplete="off"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Новый файл .xlsx</label>
            <div className={styles.fileWrap}>
              <input
                type="file"
                accept={ACCEPTED_FILE_EXT}
                className={styles.fileInput}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                id="file-edit"
              />
              <label htmlFor="file-edit" className={styles.fileLabel}>
                Выберите файл
              </label>
            </div>
            {file ? (
              <div className={styles.fileName}>{file.name}</div>
            ) : (
              <div className={styles.hint}>Загрузите новый .xlsx для замены данных</div>
            )}
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <Link to={id ? ROUTES.CHART(id) : ROUTES.HOME} className={`${styles.btn} ${styles.btnSecondary}`}>
              Отмена
            </Link>
          </div>
        </form>
      </article>
    </section>
  );
}
