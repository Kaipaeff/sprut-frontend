import type { SeriesPoint } from '../types/api';
import { CHANNELS } from '../constants/channels';

const MAX_POINTS = 1500;

/**
 * Равномерное прореживание с сохранением глобальных экстремумов.
 *
 * Алгоритм: берём каждую N-ю точку (N = ceil(length / MAX_POINTS)),
 * затем дополнительно включаем индексы глобального min и max по каждому
 * из 5 каналов (до +10 точек). Set гарантирует отсутствие дубликатов.
 * Финальная сортировка восстанавливает хронологический порядок.
 *
 * Сложность: O(n) по времени, O(MAX_POINTS) по памяти.
 * Компромисс: быстро, но может пропускать короткие локальные всплески
 * между шагами выборки — для этого есть minMaxDownsample.
 */
export function downsampledSeries(series: SeriesPoint[], maxPoints = MAX_POINTS): SeriesPoint[] {
  if (series.length <= maxPoints) return series;

  const step = Math.ceil(series.length / maxPoints);
  const indices = new Set<number>();

  // Равномерная сетка
  for (let i = 0; i < series.length; i += step) indices.add(i);

  // Глобальные экстремумы по каждому каналу — без них YAxis-масштаб будет неверным
  for (const key of CHANNELS) {
    let minIdx = 0, maxIdx = 0;
    let minVal = series[0][key], maxVal = series[0][key];
    for (let i = 1; i < series.length; i++) {
      const v = series[i][key];
      if (v < minVal) { minVal = v; minIdx = i; }
      if (v > maxVal) { maxVal = v; maxIdx = i; }
    }
    indices.add(minIdx);
    indices.add(maxIdx);
  }

  return Array.from(indices).sort((a, b) => a - b).map((i) => series[i]);
}

/**
 * Min-Max (envelope) downsampling — стандартный подход для time-series визуализации
 * (аналог алгоритмов Grafana/Prometheus для больших временных рядов).
 *
 * Данные разбиваются на (maxPoints / 2) бакетов равной длины. Из каждого бакета
 * берутся 2 точки: с минимальной и максимальной амплитудой, что формирует
 * «огибающую» (envelope) сигнала. Результат — до maxPoints точек.
 *
 * Амплитуда вычисляется как max(|emg1|, |emg2|, |emg3|, |emg4|, |angle|).
 * Для данных ЭМГ это означает, что любой кратковременный всплеск в любом
 * канале будет гарантированно отображён — в отличие от равномерной выборки,
 * которая может «перешагнуть» через узкий пик.
 *
 * Точки внутри каждого бакета сортируются по timestamp (меньший индекс первым),
 * чтобы сохранить хронологический порядок без дополнительной сортировки результата.
 *
 * Сложность: O(n), один проход по массиву.
 */
export function minMaxDownsample(series: SeriesPoint[], maxPoints: number): SeriesPoint[] {
  if (series.length <= maxPoints) return series;

  const numBuckets = Math.ceil(maxPoints / 2);
  const bucketSize = series.length / numBuckets;
  const result: SeriesPoint[] = [];

  for (let b = 0; b < numBuckets; b++) {
    const start = Math.floor(b * bucketSize);
    const end = Math.min(Math.floor((b + 1) * bucketSize), series.length);
    if (start >= end) continue;

    let minIdx = start;
    let maxIdx = start;
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (let i = start; i < end; i++) {
      const p = series[i];
      const amp = Math.max(...CHANNELS.map((k) => Math.abs(p[k])));
      if (amp < minVal) { minVal = amp; minIdx = i; }
      if (amp > maxVal) { maxVal = amp; maxIdx = i; }
    }

    // Хронологический порядок внутри бакета
    if (minIdx <= maxIdx) {
      result.push(series[minIdx]);
      if (minIdx !== maxIdx) result.push(series[maxIdx]);
    } else {
      result.push(series[maxIdx]);
      if (minIdx !== maxIdx) result.push(series[minIdx]);
    }
  }

  return result;
}
