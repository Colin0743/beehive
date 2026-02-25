'use client';

import { useMemo } from 'react';
import { getRegion, type Region } from '@/lib/region';

/**
 * React Hook：获取当前区域标识
 * 仅在客户端组件中使用
 */
export function useRegion(): Region {
  return useMemo(() => getRegion(), []);
}
