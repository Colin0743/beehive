import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware — 刷新 Supabase Auth session
 *
 * 每次请求经过时，通过 getUser() 触发 token 刷新，
 * 确保过期的 session 被自动续期，cookie 在请求/响应间正确传递。
 */
export async function middleware(request: NextRequest) {
  // 先创建一个未修改的响应，后续通过 cookie 回调写入更新
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 同时写入请求 cookie（供后续服务端组件读取）和响应 cookie（返回给浏览器）
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 调用 getUser() 触发 session 刷新（不要用 getSession()，它不会验证 token）
  await supabase.auth.getUser();

  return supabaseResponse;
}

// 匹配所有需要认证的路由，排除静态资源和内部路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除以下前缀：
     * - _next/static（静态资源）
     * - _next/image（图片优化）
     * - favicon.ico（网站图标）
     * - 常见静态文件扩展名（svg、png、jpg 等）
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
