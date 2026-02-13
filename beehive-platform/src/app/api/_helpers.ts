import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// API 工具函数
// 提供统一的认证检查、响应格式、字段验证
// ============================================================

/**
 * 认证结果类型
 * 成功时返回 Supabase 客户端和用户 ID
 * 失败时返回 null（调用方应使用 errorResponse 返回 401）
 */
export interface AuthResult {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * 获取已认证的 Supabase 客户端
 * 从 cookie 中读取 session，验证用户身份
 * @returns 认证成功返回 { supabase, userId }，未认证返回 null
 */
export async function getAuthenticatedClient(): Promise<AuthResult | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { supabase, userId: user.id };
}

/**
 * 返回成功响应
 * 格式：{ success: true, data: T }
 * @param data 响应数据
 * @param status HTTP 状态码，默认 200
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * 返回错误响应
 * 格式：{ success: false, error: string }
 * @param error 错误信息
 * @param status HTTP 状态码
 */
export function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * 验证请求体的必填字段
 * @param body 请求体对象
 * @param fields 必填字段名列表
 * @returns 缺失字段列表，全部存在时返回 null
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  fields: string[]
): string[] | null {
  const missing = fields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );
  return missing.length > 0 ? missing : null;
}
