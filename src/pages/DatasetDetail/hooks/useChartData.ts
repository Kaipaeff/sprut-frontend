import { useMemo } from 'react';
import { downsampledSeries, minMaxDownsample } from '../../../utils/downsample';
import { CHANNELS } from '../../../constants/channels';
import type { SeriesPoint } from '../../../types/api';

const MAX_POINTS_RENDER = 4000;

export type DataMode = 'light' | 'detailed' | 'minmax';

/**
 * Нормализация и фильтрация: бэкенд может вернуть строковые значения
 * или NaN/Infinity (например, при битых строках в xlsx).
 * Отбрасываем невалидные точки до передачи в Recharts,
 * иначе SVG-рендер сломается на NaN-атрибутах.
 */
function sanitizeSeries(series: SeriesPoint[]): SeriesPoint[] {
  return series
    .map((point) => {
      const timestamp = Number(point.timestamp);
      const emg1 = Number(point.emg1);
      const emg2 = Number(point.emg2);
      const emg3 = Number(point.emg3);
      const emg4 = Number(point.emg4);
      const angle = Number(point.angle);
      if (
        !Number.isFinite(timestamp) ||
        !Number.isFinite(emg1) ||
        !Number.isFinite(emg2) ||
        !Number.isFinite(emg3) ||
        !Number.isFinite(emg4) ||
        !Number.isFinite(angle)
      ) {
        return null;
      }
      return { timestamp, emg1, emg2, emg3, emg4, angle };
    })
    .filter((p): p is SeriesPoint => p !== null);
}

interface ChartDataResult {
  chartData: SeriesPoint[];
  totalPoints: number;
  isCapped: boolean;
}

export function useChartData(
  series: SeriesPoint[] | undefined,
  dataMode: DataMode,
  isMobile: boolean,
): ChartDataResult {
  return useMemo(() => {
    if (!series?.length) {
      return { chartData: [] as SeriesPoint[], totalPoints: 0, isCapped: false };
    }
    const raw = sanitizeSeries(series);
    if (!raw.length) {
      return { chartData: [] as SeriesPoint[], totalPoints: 0, isCapped: false };
    }
    const totalPoints = raw.length;

    if (dataMode === 'light') {
      const downsampled = downsampledSeries(raw);
      const forChart =
        isMobile && downsampled.length > 220
          ? downsampled.filter((_, i) => i % Math.ceil(downsampled.length / 220) === 0)
          : downsampled;
      return { chartData: forChart, totalPoints, isCapped: false };
    }

    if (dataMode === 'minmax') {
      if (raw.length <= MAX_POINTS_RENDER) {
        return { chartData: raw, totalPoints, isCapped: false };
      }
      const sampled = minMaxDownsample(raw, MAX_POINTS_RENDER);
      return { chartData: sampled, totalPoints, isCapped: true };
    }

    if (raw.length <= MAX_POINTS_RENDER) {
      return { chartData: raw, totalPoints, isCapped: false };
    }
    const capped = downsampledSeries(raw, MAX_POINTS_RENDER);
    return { chartData: capped, totalPoints, isCapped: true };
  }, [series, isMobile, dataMode]);
}

// API возвращает stats.mean и stats.max, но не stats.min —
// вычисляем на клиенте по полному (не прореженному) массиву series.
export function useMinStats(series: SeriesPoint[] | undefined): Record<string, number> | null {
  return useMemo(() => {
    if (!series?.length) return null;
    const raw = sanitizeSeries(series);
    if (!raw.length) return null;
    const mins: Record<string, number> = {};
    for (const key of CHANNELS) {
      let min = raw[0][key];
      for (let i = 1; i < raw.length; i++) {
        if (raw[i][key] < min) min = raw[i][key];
      }
      mins[key] = min;
    }
    return mins;
  }, [series]);
}

export { MAX_POINTS_RENDER };
