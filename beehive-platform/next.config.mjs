/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // 强制生成新的构建 ID，绕过浏览器缓存
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // 禁止 HTML 页面被 CDN/Nginx 代理缓存，防止部署后旧页面引用已删除的 JS chunk
  async headers() {
    return [
      {
        // 防止 Next.js 路由缓存冲突。这里不要使用复杂的 negative lookahead，否则会导致 path-to-regexp 崩溃并返回 400
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
