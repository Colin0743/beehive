/**
 * 区域配置模块
 * 通过 NEXT_PUBLIC_REGION 环境变量确定当前运行区域
 */

/** 区域类型：国内版 'cn' 或海外版 'global' */
export type Region = 'cn' | 'global';

/** 有效的区域标识列表 */
const VALID_REGIONS: Region[] = ['cn', 'global'];

/**
 * 获取当前区域标识
 * 读取 NEXT_PUBLIC_REGION 环境变量，无效值默认回退到 'cn'
 */
export function getRegion(): Region {
  const raw = process.env.NEXT_PUBLIC_REGION as string | undefined;

  if (!raw || !VALID_REGIONS.includes(raw as Region)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[Region] NEXT_PUBLIC_REGION="${raw}" 无效，回退到 "cn"。有效值: ${VALID_REGIONS.join(', ')}`
      );
    }
    return 'cn';
  }

  return raw as Region;
}

/** 是否为国内版 */
export function isCN(): boolean {
  return getRegion() === 'cn';
}

/** 是否为海外版 */
export function isGlobal(): boolean {
  return getRegion() === 'global';
}

// 开发模式下输出当前区域标识
if (process.env.NODE_ENV === 'development') {
  const region = getRegion();
  console.log(`[Region] 当前区域: ${region} (${region === 'cn' ? '国内版' : '海外版'})`);
}
