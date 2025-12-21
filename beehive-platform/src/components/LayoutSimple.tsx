'use client';

import React, { ReactNode } from 'react';
import HeaderSimple from './HeaderSimple';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function LayoutSimple({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <HeaderSimple />
      <main className="flex-1 pb-12">
        <div className="max-w-[1440px] mx-auto px-8">
          {title && (
            <h1 className="text-3xl text-[#111827] mb-6 pt-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
