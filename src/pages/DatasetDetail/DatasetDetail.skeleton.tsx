import styles from './DatasetDetail.module.css';

export function DatasetDetailSkeleton() {
  return (
    <section>
      <div className={styles.skeletonBack} aria-hidden />
      <div className={styles.titleRow}>
        <div className={styles.skeletonTitle} aria-hidden />
        <div className={styles.skeletonBtn} aria-hidden />
      </div>

      <div className={styles.statsCompact} aria-hidden>
        <div className={styles.statsPeaks}>
          <span className={styles.skeletonStatLabel} aria-hidden />
          <span className={styles.skeletonStatValue} aria-hidden />
        </div>
        <div className={styles.statsTableWrap}>
          <div className={styles.skeletonTable} aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonTableRow} aria-hidden />
            ))}
          </div>
        </div>
      </div>

      <section className={styles.chartSection} aria-hidden>
        <div className={styles.skeletonChartTitle} aria-hidden />
        <div className={styles.chartWrap}>
          <div className={styles.chartContent}>
            <div className={styles.skeletonChart} aria-hidden />
            <div className={styles.skeletonBrush} aria-hidden />
          </div>
        </div>
      </section>
    </section>
  );
}
