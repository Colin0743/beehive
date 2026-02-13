/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // 强制生成新的构建 ID，绕过浏览器缓存
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
