import {
  validateTitle,
  validateDuration,
  validateTargetDuration,
  validateCurrentDuration,
  validateTelegramGroup,
} from './validators';

describe('Validators', () => {
  describe('validateTitle', () => {
    it('should return null for valid title', () => {
      expect(validateTitle('Valid Title')).toBeNull();
    });

    it('should return error for empty title', () => {
      expect(validateTitle('')).toBe('标题不能为空');
    });

    it('should return error for whitespace title', () => {
      expect(validateTitle('   ')).toBe('标题不能为空');
    });
  });

  describe('validateDuration', () => {
    it('should return null for valid duration', () => {
      expect(validateDuration(10)).toBeNull();
    });

    it('should return error for non-integer', () => {
      expect(validateDuration(10.5)).toBe('时长必须为整数');
    });

    it('should return error for duration < 5', () => {
      expect(validateDuration(4)).toBe('时长必须在 5 到 30 之间');
    });

    it('should return error for duration > 30', () => {
      expect(validateDuration(31)).toBe('时长必须在 5 到 30 之间');
    });
  });

  describe('validateTargetDuration', () => {
    it('should return null for valid target duration', () => {
      expect(validateTargetDuration(100)).toBeNull();
    });

    it('should return error for non-integer', () => {
      expect(validateTargetDuration(100.5)).toBe('目标时长必须为整数');
    });

    it('should return error for zero or negative', () => {
      expect(validateTargetDuration(0)).toBe('目标时长必须为正整数');
      expect(validateTargetDuration(-1)).toBe('目标时长必须为正整数');
    });
  });

  describe('validateCurrentDuration', () => {
    it('should return null for valid current duration', () => {
      expect(validateCurrentDuration(0)).toBeNull();
      expect(validateCurrentDuration(10)).toBeNull();
    });

    it('should return error for non-integer', () => {
      expect(validateCurrentDuration(10.5)).toBe('当前时长必须为整数');
    });

    it('should return error for negative', () => {
      expect(validateCurrentDuration(-1)).toBe('当前时长不能为负数');
    });
  });

  describe('validateTelegramGroup', () => {
    it('should return null for empty string (optional)', () => {
      expect(validateTelegramGroup('')).toBeNull();
      expect(validateTelegramGroup('   ')).toBeNull();
    });

    it('should return null for valid URL', () => {
      expect(validateTelegramGroup('https://t.me/test')).toBeNull();
    });

    it('should return error for invalid URL', () => {
      expect(validateTelegramGroup('invalid-url')).toBe('请输入有效的 URL 地址');
    });
  });
});
