import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

/**
 * Auth 回调路由
 * 用户点击邮件中的 Magic Link 后，Supabase 会重定向到此路由。
 * 此路由负责用 code 换取 session，然后重定向到首页。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 登录成功，重定向到首页
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // code 缺失或换取 session 失败，重定向到登录页并提示错误
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
