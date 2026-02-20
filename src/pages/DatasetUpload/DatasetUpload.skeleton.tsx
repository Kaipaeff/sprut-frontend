import styles from './DatasetUpload.module.css';

export function DatasetUploadSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-hidden>
      <div className={styles.skeletonTitle} aria-hidden />
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <div className={styles.skeletonLine} aria-hidden />
          <div className={styles.skeletonInput} aria-hidden />
        </div>
        <div className={styles.formGroup}>
          <div className={styles.skeletonLine} aria-hidden />
          <div className={styles.skeletonFileArea} aria-hidden />
        </div>
        <div className={styles.actions}>
          <div className={styles.skeletonBtn} aria-hidden />
        </div>
      </div>
    </div>
  );
}
