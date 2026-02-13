/**
 * 表单验证失败时，自动滚动到第一个出错的字段
 * 通过 name 属性或 data-field 属性匹配表单字段
 * @param errorFields - 出错的字段名数组（取第一个）
 */
export function scrollToFirstError(errorFields: string[]) {
  if (errorFields.length === 0) return;

  const firstField = errorFields[0];
  // 优先通过 name 属性查找，其次通过 data-field 属性查找
  const el =
    document.querySelector<HTMLElement>(`[name="${firstField}"]`) ||
    document.querySelector<HTMLElement>(`[data-field="${firstField}"]`);

  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // 如果是可聚焦元素，自动聚焦
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      setTimeout(() => el.focus(), 400);
    }
  }
}
