import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  Legend,
} from 'recharts';
import { DatasetDetailSkeleton } from './DatasetDetail.skeleton';
import {
  useDataset,
  useChartData,
  useMinStats,
  useBrush,
  useChartTooltip,
  useWindowWidth,
  MAX_POINTS_RENDER,
} from './hooks';
import type { DataMode } from './hooks';
import { CHANNELS, CHANNEL_COLORS } from '../../constants/channels';
import { ROUTES } from '../../constants/routes';
import styles from './DatasetDetail.module.css';

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const isMobile = useWindowWidth() < 600;

  const { data, error } = useDataset(id);
  const [dataMode, setDataMode] = useState<DataMode>('light');
  const [chartLayout, setChartLayout] = useState<'combined' | 'separate'>('combined');
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const { chartData, totalPoints, isCapped } = useChartData(data?.series, dataMode, isMobile);
  const minStats = useMinStats(data?.series);
  const {
    brushRange,
    setBrushRange,
    visibleData,
    handleBrushChange,
    resetRange,
    brushStartIndex,
    brushEndIndex,
    hasSelection,
  } = useBrush(chartData);
  const { tooltipActive, hideTooltip, showTooltip } = useChartTooltip();

  useEffect(() => {
    setBrushRange(null);
    setHiddenSeries(new Set());
    hideTooltip();
  }, [id, setBrushRange, hideTooltip]);

  const toggleSeries = (dataKey: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
    hideTooltip();
  };

  if (error) {
    return (
      <section>
        <Link to={ROUTES.HOME} className={styles.back}>← Назад</Link>
        <div className={styles.error} role="alert">{error}</div>
        <nav style={{ marginTop: 16 }} aria-label="Возврат на главную">
          <Link to={ROUTES.HOME} className={styles.btn}>Вернуться на главную</Link>
        </nav>
      </section>
    );
  }

  if (data === null) {
    return <DatasetDetailSkeleton />;
  }

  const stats = data.stats;

  const renderLegendContent = (payload: Array<{ dataKey?: unknown; color?: string; value?: string }> | undefined) => (
    <ul className={styles.legendList}>
      {payload?.map((entry) => {
        const key = typeof entry.dataKey === 'string' ? entry.dataKey : String(entry.dataKey ?? '');
        const hidden = hiddenSeries.has(key);
        return (
          <li key={key} className={styles.legendItem}
            onClick={(e) => { e.stopPropagation(); toggleSeries(key); }}
            onKeyDown={(e) => e.key === 'Enter' && toggleSeries(key)}
            role="button" tabIndex={0}
          >
            <span className={styles.legendIcon} style={{ backgroundColor: entry.color }} />
            <span className={hidden ? styles.legendLabelHidden : undefined}>{entry.value}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-labelledby="detail-title">
      <Link to={ROUTES.HOME} className={styles.back}>← Назад</Link>
      <div className={styles.titleRow}>
        <h1 id="detail-title" className={styles.title}>
          <span className={styles.titleLabel}>Имя файла</span>
          <span className={styles.titleDivider} />
          <span className={styles.titleName}>{data.name}</span>
        </h1>
        <Link to={ROUTES.DATASET_EDIT(id!)} className={styles.btn}>Редактировать датасет</Link>
      </div>

      <div className={styles.statsCompact} aria-label="Статистика датасета">
        <div className={styles.statsPeaks}>
          <span className={styles.statsPeaksLabel}>Пики (peaks)</span>
          <span className={styles.statsPeaksValue}>{stats.peaks}</span>
        </div>
        <div className={styles.statsTableWrap}>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Канал</th>
                <th>Минимум</th>
                <th>Среднее</th>
                <th>Максимум</th>
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((key) => (
                <tr key={key}>
                  <td className={styles.statsChannelName} style={{ color: CHANNEL_COLORS[key] }}>{key.toUpperCase()}</td>
                  <td>{minStats && typeof minStats[key] === 'number' ? Number(minStats[key]).toFixed(2) : '—'}</td>
                  <td>{typeof stats.mean[key] === 'number' ? Number(stats.mean[key]).toFixed(2) : '—'}</td>
                  <td>{typeof stats.max[key] === 'number' ? Number(stats.max[key]).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className={styles.chartSection} aria-labelledby="chart-heading">
        <h2 id="chart-heading" className={styles.chartTitle}>
          Визуализация зависимости значений мышечной активности от времени
        </h2>

        <div className={styles.chartSettings}>
          <div className={styles.chartModeToggle} role="group" aria-label="Режим данных для графика">
            <button type="button"
              className={dataMode === 'light' ? `${styles.modeBtn} ${styles.modeBtnActive}` : styles.modeBtn}
              onClick={() => { setDataMode('light'); setBrushRange(null); }}
            >Меньше точек (до 1500)</button>
            <button type="button"
              className={dataMode === 'detailed' ? `${styles.modeBtn} ${styles.modeBtnActive}` : styles.modeBtn}
              onClick={() => { setDataMode('detailed'); setBrushRange(null); }}
            >Больше точек (до {MAX_POINTS_RENDER})</button>
            <button type="button"
              className={dataMode === 'minmax' ? `${styles.modeBtn} ${styles.modeBtnActive}` : styles.modeBtn}
              onClick={() => { setDataMode('minmax'); setBrushRange(null); }}
            >Min-Max (до {MAX_POINTS_RENDER})</button>
          </div>
          <div className={styles.chartModeToggle} role="group" aria-label="Режим отображения графика">
            <button type="button"
              className={chartLayout === 'combined' ? `${styles.modeBtn} ${styles.modeBtnActive}` : styles.modeBtn}
              onClick={() => { setChartLayout('combined'); setBrushRange(null); }}
            >Совмещённый</button>
            <button type="button"
              className={chartLayout === 'separate' ? `${styles.modeBtn} ${styles.modeBtnActive}` : styles.modeBtn}
              onClick={() => { setChartLayout('separate'); setBrushRange(null); }}
            >Раздельный</button>
          </div>
          {hasSelection && (
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetRange}>
              Сбросить диапазон
            </button>
          )}
        </div>

        {isCapped && (
          <p className={styles.chartDataNotice} role="status">
            Показано {chartData.length.toLocaleString('ru-RU')} из {totalPoints.toLocaleString('ru-RU')} точек.
            {dataMode === 'minmax'
              ? ' Алгоритм Min-Max: все локальные пики и впадины сохранены.'
              : ' Ограничение для стабильной работы в браузере.'}
          </p>
        )}

        {chartLayout === 'combined' ? (
          <div key={`combined-${dataMode}`} className={styles.chartWrap}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (!target.closest('.recharts-tooltip-wrapper') && !target.closest(`.${styles.legendItem}`)) hideTooltip();
            }}
            onTouchStart={(e) => {
              if (isMobile) {
                const target = e.target as HTMLElement;
                if (!target.closest('.recharts-tooltip-wrapper') && !target.closest(`.${styles.legendItem}`)) hideTooltip();
              }
            }}
          >
            <div className={styles.chartContent}>
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 280}>
                <LineChart data={visibleData}
                  margin={{ top: 8, right: isMobile ? 28 : 48, left: isMobile ? 28 : 8, bottom: 8 }}
                  onClick={() => { if (isMobile) hideTooltip(); }}
                  onMouseMove={showTooltip}
                  onMouseLeave={hideTooltip}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaecef" />
                  <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']}
                    tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                    fontSize={isMobile ? 10 : 11}
                    interval={isMobile ? Math.max(0, Math.floor(visibleData.length / 4)) : undefined}
                    angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 30}
                  />
                  <YAxis yAxisId="left" fontSize={isMobile ? 10 : 11} width={isMobile ? 34 : 60} />
                  <YAxis yAxisId="right" orientation="right" fontSize={isMobile ? 10 : 11} width={isMobile ? 30 : 50} domain={['dataMin', 'dataMax']} />
                  <Tooltip active={tooltipActive}
                    labelFormatter={(t) => new Date(Number(t)).toLocaleString()}
                    formatter={(value: number | undefined) => [value != null ? Number(value).toFixed(2) : '—', '']}
                  />
                  <Legend content={({ payload }) => renderLegendContent(payload as Array<{ dataKey?: unknown; color?: string; value?: string }>)} />
                  <Line type="monotone" dataKey="emg1" yAxisId="left" stroke="#2563eb" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg1') ? 0 : 1} dot={false} name="EMG1" />
                  <Line type="monotone" dataKey="emg2" yAxisId="left" stroke="#059669" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg2') ? 0 : 1} dot={false} name="EMG2" />
                  <Line type="monotone" dataKey="emg3" yAxisId="left" stroke="#d97706" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg3') ? 0 : 1} dot={false} name="EMG3" />
                  <Line type="monotone" dataKey="emg4" yAxisId="left" stroke="#dc2626" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg4') ? 0 : 1} dot={false} name="EMG4" />
                  <Line type="monotone" dataKey="angle" yAxisId="right" stroke="#7c3aed" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('angle') ? 0 : 1} dot={false} name="Angle" />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ height: isMobile ? 60 : 50, width: '100%' }} key={brushRange === null ? 'full' : 'zoomed'}>
                <ResponsiveContainer width="100%" height={isMobile ? 60 : 50}>
                  <LineChart data={chartData} margin={{ top: 0, right: 8, left: isMobile ? 8 : 0, bottom: 0 }}>
                    <XAxis dataKey="timestamp" type="number" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Brush dataKey="timestamp" height={isMobile ? 50 : 40} stroke="#00a896" fill="#e0f2f1"
                      startIndex={brushStartIndex} endIndex={brushEndIndex} onChange={handleBrushChange}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div key={`separate-${dataMode}`} className={styles.separateCharts}>
            <div className={styles.chartWrap}>
              <h3 className={styles.separateChartTitle}>ЭМГ-каналы (EMG1–EMG4)</h3>
              <div className={styles.chartContent}>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 240}>
                  <LineChart data={visibleData}
                    margin={{ top: 8, right: isMobile ? 12 : 24, left: isMobile ? 28 : 8, bottom: 8 }}
                    onMouseMove={showTooltip} onMouseLeave={hideTooltip}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaecef" />
                    <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']}
                      tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                      fontSize={isMobile ? 10 : 11}
                      interval={isMobile ? Math.max(0, Math.floor(visibleData.length / 4)) : undefined}
                      angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 30}
                    />
                    <YAxis fontSize={isMobile ? 10 : 11} width={isMobile ? 34 : 60} />
                    <Tooltip active={tooltipActive}
                      labelFormatter={(t) => new Date(Number(t)).toLocaleString()}
                      formatter={(value: number | undefined) => [value != null ? Number(value).toFixed(2) : '—', '']}
                    />
                    <Legend content={({ payload }) => renderLegendContent(payload as Array<{ dataKey?: unknown; color?: string; value?: string }>)} />
                    <Line type="monotone" dataKey="emg1" stroke="#2563eb" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg1') ? 0 : 1} dot={false} name="EMG1" />
                    <Line type="monotone" dataKey="emg2" stroke="#059669" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg2') ? 0 : 1} dot={false} name="EMG2" />
                    <Line type="monotone" dataKey="emg3" stroke="#d97706" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg3') ? 0 : 1} dot={false} name="EMG3" />
                    <Line type="monotone" dataKey="emg4" stroke="#dc2626" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('emg4') ? 0 : 1} dot={false} name="EMG4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={styles.chartWrap}>
              <h3 className={styles.separateChartTitle}>Угол (Angle)</h3>
              <div className={styles.chartContent}>
                <ResponsiveContainer width="100%" height={isMobile ? 180 : 200}>
                  <LineChart data={visibleData}
                    margin={{ top: 8, right: isMobile ? 12 : 24, left: isMobile ? 28 : 8, bottom: 8 }}
                    onMouseMove={showTooltip} onMouseLeave={hideTooltip}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaecef" />
                    <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']}
                      tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                      fontSize={isMobile ? 10 : 11}
                      interval={isMobile ? Math.max(0, Math.floor(visibleData.length / 4)) : undefined}
                      angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 30}
                    />
                    <YAxis fontSize={isMobile ? 10 : 11} width={isMobile ? 34 : 60} domain={['dataMin', 'dataMax']} />
                    <Tooltip active={tooltipActive}
                      labelFormatter={(t) => new Date(Number(t)).toLocaleString()}
                      formatter={(value: number | undefined) => [value != null ? Number(value).toFixed(2) : '—', '']}
                    />
                    <Line type="monotone" dataKey="angle" stroke="#7c3aed" strokeWidth={isMobile ? 1.5 : 2} strokeOpacity={hiddenSeries.has('angle') ? 0 : 1} dot={false} name="Angle" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ height: isMobile ? 60 : 50, width: '100%' }} key={brushRange === null ? 'full' : 'zoomed'}>
              <ResponsiveContainer width="100%" height={isMobile ? 60 : 50}>
                <LineChart data={chartData} margin={{ top: 0, right: 8, left: isMobile ? 8 : 0, bottom: 0 }}>
                  <XAxis dataKey="timestamp" type="number" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Brush dataKey="timestamp" height={isMobile ? 50 : 40} stroke="#00a896" fill="#e0f2f1"
                    startIndex={brushStartIndex} endIndex={brushEndIndex} onChange={handleBrushChange}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
