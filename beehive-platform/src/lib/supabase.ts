import { createBrowserClient } from '@supabase/ssr';

// 浏览器端 Supabase 客户端
// 用于前端 Auth 操作（OTP 登录、会话管理等）
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error(
      '[Supabase] 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL，请在 .env.local 中配置'
    );
  }

  if (!supabaseAnonKey) {
    console.error(
      '[Supabase] 缺少环境变量 NEXT_PUBLIC_SUPABASE_ANON_KEY，请在 .env.local 中配置'
    );
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
