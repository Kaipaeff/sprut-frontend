import { useState, useRef, useEffect, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDataset, fetchDatasets } from '../../api/datasets';
import { getErrorMessage } from '../../utils/errorHandler';
import { ROUTES } from '../../constants/routes';
import { FORM_FIELDS, ACCEPTED_FILE_EXT } from '../../constants/api';
import { FILE_VALIDATION } from '../../constants/errorMessages';
import type { DatasetItem } from '../../types/api';
import styles from './DatasetUpload.module.css';

const PROGRESS_FAST_UNTIL = 90;
const TICK_MS_FAST = 80;
const TICK_MS_SLOW = 350;

export function DatasetUpload() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);
  const slowTicksRef = useRef(0);
  const [existingDatasets, setExistingDatasets] = useState<DatasetItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDatasets()
      .then((list) => { if (!cancelled) setExistingDatasets(list); })
      .catch(() => { if (!cancelled) setExistingDatasets([]); });
    return () => { cancelled = true; };
  }, []);

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const runProgressTick = () => {
    if (progressRef.current < PROGRESS_FAST_UNTIL) {
      setUploadProgress((prev) => {
        const next = Math.min(prev + 1, 100);
        progressRef.current = next;
        return next;
      });
    } else if (progressRef.current < 100) {
      slowTicksRef.current += 1;
      if (slowTicksRef.current >= Math.ceil(TICK_MS_SLOW / TICK_MS_FAST)) {
        slowTicksRef.current = 0;
        setUploadProgress((prev) => {
          const next = Math.min(prev + 1, 100);
          progressRef.current = next;
          if (next === 100) clearProgressTimer();
          return next;
        });
      }
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith(ACCEPTED_FILE_EXT)) {
      setError(FILE_VALIDATION.WRONG_FORMAT);
      return;
    }
    setFile(selectedFile);
    setError(null);
    if (!name.trim()) {
      const baseName = selectedFile.name.replace(new RegExp(`\\${ACCEPTED_FILE_EXT}$`, 'i'), '');
      setName(baseName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Выберите файл для загрузки в формате .xlsx');
      return;
    }
    if (!file.name.toLowerCase().endsWith(ACCEPTED_FILE_EXT)) {
      setError(FILE_VALIDATION.WRONG_FORMAT);
      return;
    }
    const nameTrimmed = name.trim();
    if (existingDatasets?.some((d) => d.name === nameTrimmed)) {
      setError('Датасет с таким названием уже загружен');
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    progressRef.current = 0;
    slowTicksRef.current = 0;
    clearProgressTimer();
    progressTimerRef.current = setInterval(runProgressTick, TICK_MS_FAST);
    try {
      const formData = new FormData();
      formData.append(FORM_FIELDS.DATASET_NAME, nameTrimmed);
      formData.append(FORM_FIELDS.FILE, file);
      const { id } = await createDataset(formData);
      clearProgressTimer();
      setUploadProgress(100);
      navigate(ROUTES.CHART(id));
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, {
          defaultMessage: 'Ошибка загрузки файла',
          networkErrorMessage: 'Ошибка загрузки файла. Проверьте подключение к серверу',
        })
      );
    } finally {
      clearProgressTimer();
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="upload-title">
      {loading && <div className={styles.fullPageOverlay} aria-hidden />}
      <h1 id="upload-title" className={styles.title}>Личный кабинет</h1>
      <article className={styles.card}>
        {loading && (
          <div className={styles.loadingOverlay} aria-live="polite" aria-busy="true">
            <div className={styles.loadingRow}>
              <span className={styles.loadingText}>
                {uploadProgress < 100 ? 'Загрузка датасета…' : 'Готово'}
              </span>
              <span className={styles.loadingPercent}>{uploadProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}
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
              disabled={!file}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="file-upload">Файл .xlsx</label>
            <div
              className={`${styles.fileWrap} ${isDragging ? styles.fileWrapDragging : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept={ACCEPTED_FILE_EXT}
                className={styles.fileInput}
                onChange={(e) => {
                  const chosen = e.target.files?.[0] ?? null;
                  handleFileSelect(chosen);
                }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className={styles.fileLabel}>
                {isDragging ? 'Отпустите файл для загрузки' : 'Выберите файл или перетащите его сюда'}
              </label>
            </div>
            {file && <div className={styles.fileName}>{file.name}</div>}
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              Загрузить
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
