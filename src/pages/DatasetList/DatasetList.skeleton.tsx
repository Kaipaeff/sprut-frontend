import styles from './DatasetList.module.css';

const ROWS = 6;

export function DatasetListSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-hidden>
      <div className={styles.skeletonTitle} aria-hidden />
      <div className={styles.card}>
        <ul className={styles.list}>
          {Array.from({ length: ROWS }).map((_, i) => (
            <li key={i} className={styles.row}>
              <div className={styles.info}>
                <span className={styles.skeletonId} aria-hidden />
                <span className={styles.separator} aria-hidden />
                <span className={styles.skeletonName} aria-hidden />
              </div>
              <div className={styles.skeletonBtn} aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
