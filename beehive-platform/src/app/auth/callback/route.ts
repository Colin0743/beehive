import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Auth 回调路由
 * 用户点击邮件中的 Magic Link 后，Supabase 会重定向到此路由。
 * 此路由负责用 code 换取 session，然后重定向到首页。
 * 
 * 注意：Route Handler 中必须显式将 cookie 设置到 response 上，
 * 不能依赖 cookies() API 自动传递。
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  // 在反向代理（Nginx）后面，request.url 的 origin 是内部地址（如 localhost:3001），
  // 需要从环境变量或 x-forwarded 头获取真实的外部 origin。
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const origin = process.env.NEXT_PUBLIC_APP_URL
    || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin);

  if (code) {
    // 根据 type 决定跳转页面
    let next = '/';
    if (type === 'recovery') {
      next = '/auth/update-password';
    }

    // 创建一个重定向响应，后续将 cookie 设置到这个响应上
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 登录成功，返回带有 session cookie 的重定向响应
      return response;
    }
  }

  // code 缺失或换取 session 失败，重定向到登录页并提示错误
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
