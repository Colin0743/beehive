import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 强制所有页面动态渲染，防止 Next.js 给静态页面加 s-maxage=31536000 缓存头
// 这是导致部署后 ChunkLoadError 的根本原因
export const dynamic = 'force-dynamic';

import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PageLoader from "@/components/PageLoader";
import I18nProvider from "@/components/I18nProvider";
import DynamicTitle from "@/components/DynamicTitle";
import { getRegion } from "@/lib/region";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#0a0a0b',
};

// 根据区域动态生成元数据
const regionMeta = {
  cn: {
    title: '泱泱云合AI制片厂 - AI视频协作平台',
    description: 'AI视频创作者的协作平台，汇聚创意与算力',
    appleWebAppTitle: '泱泱云合',
    lang: 'zh-CN',
  },
  global: {
    title: 'Bee Studio AI - AI Video Collaboration Platform',
    description: 'AI video creators collaboration platform, gathering creativity and computing power',
    appleWebAppTitle: 'Bee Studio AI',
    lang: 'en',
  },
} as const;

const currentRegionMeta = regionMeta[getRegion()];

export const metadata: Metadata = {
  title: currentRegionMeta.title,
  description: currentRegionMeta.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: currentRegionMeta.appleWebAppTitle,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={currentRegionMeta.lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function handleChunkError() {
                if (!sessionStorage.getItem('chunk_load_failed')) {
                  sessionStorage.setItem('chunk_load_failed', 'true');
                  var url = new URL(window.location.href);
                  url.searchParams.set('_t', Date.now());
                  window.location.href = url.toString();
                }
              }

              window.addEventListener('error', function(event) {
                if (event.message && (event.message.includes('Loading chunk') || event.message.includes('ChunkLoadError'))) {
                  handleChunkError();
                }
              }, true);
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && (event.reason.name === 'ChunkLoadError' || (event.reason.message && event.reason.message.includes('Loading chunk')))) {
                  handleChunkError();
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <ErrorBoundary>
          <I18nProvider>
            <DynamicTitle />
            <AuthProvider>
              <ToastProvider>
                {/* <PageLoader /> */}
                {children}
              </ToastProvider>
            </AuthProvider>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
