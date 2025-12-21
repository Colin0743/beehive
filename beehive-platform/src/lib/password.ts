/**
 * 密码加密和验证工具
 * 使用 bcryptjs 进行密码哈希处理
 */

import bcrypt from 'bcryptjs';

/**
 * 简单哈希函数（用于演示数据兼容）
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'demo_hash_' + Math.abs(hash).toString(16);
}

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hash 密码哈希
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 支持演示数据的简单哈希
  if (hash.startsWith('demo_hash_')) {
    return simpleHash(password) === hash;
  }
  // 正常的 bcrypt 验证
  return await bcrypt.compare(password, hash);
}

