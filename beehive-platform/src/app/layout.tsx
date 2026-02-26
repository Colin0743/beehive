import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/semantic-ui@2.5.0/dist/semantic.min.css"
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
