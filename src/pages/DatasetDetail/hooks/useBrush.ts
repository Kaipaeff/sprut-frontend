import { useState, useMemo, useCallback } from 'react';
import type { SeriesPoint } from '../../../types/api';

interface BrushRange {
  startIndex: number;
  endIndex: number;
}

export function useBrush(chartData: SeriesPoint[]) {
  const [brushRange, setBrushRange] = useState<BrushRange | null>(null);

  const visibleData = useMemo(() => {
    if (!chartData.length || !brushRange) return chartData;
    const { startIndex, endIndex } = brushRange;
    return chartData.slice(Math.max(0, startIndex), endIndex + 1);
  }, [chartData, brushRange]);

  const handleBrushChange = useCallback(
    (range: { startIndex?: number; endIndex?: number } | null) => {
      if (!range || range.startIndex == null || range.endIndex == null) {
        setBrushRange(null);
        return;
      }
      setBrushRange({ startIndex: range.startIndex, endIndex: range.endIndex });
    },
    [],
  );

  const resetRange = useCallback(() => setBrushRange(null), []);

  const lastIndex = Math.max(0, chartData.length - 1);
  const brushStartIndex = Math.min(
    lastIndex,
    Math.max(0, Math.floor(brushRange?.startIndex ?? 0)),
  );
  const brushEndIndex = Math.min(
    lastIndex,
    Math.max(brushStartIndex, Math.floor(brushRange?.endIndex ?? lastIndex)),
  );

  return {
    brushRange,
    setBrushRange,
    visibleData,
    handleBrushChange,
    resetRange,
    brushStartIndex,
    brushEndIndex,
    hasSelection: brushRange !== null,
  };
}
