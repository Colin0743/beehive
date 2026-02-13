/**
 * 验证工具函数
 *
 * 用于内联编辑和表单提交时的字段验证。
 * 每个函数返回 string | null：
 *   - null 表示验证通过
 *   - string 表示验证失败的错误信息
 */

/**
 * 验证标题字段
 * 规则：非空，至少 1 个非空白字符
 *
 * @param value - 标题字符串
 * @returns 错误信息或 null
 */
export function validateTitle(value: string): string | null {
  if (!value || value.trim().length === 0) {
    return '标题不能为空';
  }
  return null;
}

/**
 * 验证任务时长（Task duration）
 * 规则：必须为整数，且 5 ≤ value ≤ 30
 *
 * @param value - 时长数值
 * @returns 错误信息或 null
 */
export function validateDuration(value: number): string | null {
  if (!Number.isInteger(value)) {
    return '时长必须为整数';
  }
  if (value < 5 || value > 30) {
    return '时长必须在 5 到 30 之间';
  }
  return null;
}

/**
 * 验证目标时长（targetDuration）
 * 规则：必须为正整数（> 0）
 *
 * @param value - 目标时长数值
 * @returns 错误信息或 null
 */
export function validateTargetDuration(value: number): string | null {
  if (!Number.isInteger(value)) {
    return '目标时长必须为整数';
  }
  if (value <= 0) {
    return '目标时长必须为正整数';
  }
  return null;
}

/**
 * 验证当前时长（currentDuration）
 * 规则：必须为非负整数（≥ 0）
 *
 * @param value - 当前时长数值
 * @returns 错误信息或 null
 */
export function validateCurrentDuration(value: number): string | null {
  if (!Number.isInteger(value)) {
    return '当前时长必须为整数';
  }
  if (value < 0) {
    return '当前时长不能为负数';
  }
  return null;
}

/**
 * 验证 Telegram 群组链接
 * 规则：空字符串允许（可选字段），非空时必须为有效 URL
 *
 * @param value - Telegram 群组链接字符串
 * @returns 错误信息或 null
 */
export function validateTelegramGroup(value: string): string | null {
  // 空字符串表示未填写，该字段为可选
  if (value === '' || value.trim() === '') {
    return null;
  }

  try {
    new URL(value);
    return null;
  } catch {
    return '请输入有效的 URL 地址';
  }
}
