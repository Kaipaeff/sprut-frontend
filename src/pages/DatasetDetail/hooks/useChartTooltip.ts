import { useState, useRef, useEffect, useCallback } from 'react';

export function useChartTooltip() {
  const [tooltipActive, setTooltipActive] = useState<boolean | undefined>(undefined);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  const hideTooltip = useCallback(() => setTooltipActive(false), []);

  const showTooltip = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltipActive(undefined);
  }, []);

  return { tooltipActive, hideTooltip, showTooltip, tooltipTimeoutRef };
}
