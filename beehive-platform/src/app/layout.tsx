import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import PageLoader from "@/components/PageLoader";
import I18nProvider from "@/components/I18nProvider";
import DynamicTitle from "@/components/DynamicTitle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bee AI Movie Studio - AI Video Collaboration Platform",
  description: "AI video creators collaboration platform, gathering creativity and computing power",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
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
                <PageLoader />
                {children}
              </ToastProvider>
            </AuthProvider>
          </I18nProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
