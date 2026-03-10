/**
 * 区域配置模块 (App 端)
 * 根据 EXPO_PUBLIC_REGION 环境变量确定区域
 */

export type Region = 'cn' | 'global';
const VALID_REGIONS: Region[] = ['cn', 'global'];

export function getRegion(): Region {
    const raw = process.env.EXPO_PUBLIC_REGION;

    if (!raw || !VALID_REGIONS.includes(raw as Region)) {
        if (__DEV__) {
            console.warn(`[Region] EXPO_PUBLIC_REGION="${raw}" 无效，默认使用 "cn"`);
        }
        return 'cn';
    }
    return raw as Region;
}

export function isCN(): boolean {
    return getRegion() === 'cn';
}

export function isGlobal(): boolean {
    return getRegion() === 'global';
}
