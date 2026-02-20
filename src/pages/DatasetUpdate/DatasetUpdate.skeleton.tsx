import styles from './DatasetUpdate.module.css';

export function DatasetUpdateSkeleton() {
  return (
    <section aria-hidden>
      <div className={styles.skeletonBack} aria-hidden />
      <div className={styles.skeletonTitle} aria-hidden />
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <div className={styles.skeletonLabel} aria-hidden />
          <div className={styles.skeletonInput} aria-hidden />
        </div>
        <div className={styles.formGroup}>
          <div className={styles.skeletonLabel} aria-hidden />
          <div className={styles.skeletonFileArea} aria-hidden />
        </div>
        <div className={styles.skeletonBtn} aria-hidden />
      </div>
    </section>
  );
}
