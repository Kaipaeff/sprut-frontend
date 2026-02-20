export interface DatasetItem {
  id: number;
  name: string;
}

export interface SeriesPoint {
  timestamp: number;
  emg1: number;
  emg2: number;
  emg3: number;
  emg4: number;
  angle: number;
}

export interface Stats {
  mean: Record<string, number>;
  max: Record<string, number>;
  peaks: number;
}

export interface DatasetDetail {
  id: number;
  name: string;
  stats: Stats;
  series: SeriesPoint[];
}
