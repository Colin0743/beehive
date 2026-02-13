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
    <div className="min-h-screen bg-[var(--ink)] flex flex-col">
      <div className="film-grain" />
      <HeaderSimple />
      <main className="flex-1 py-12">
        <div className="container">
          {title && (
            <h1 className="text-3xl text-[var(--text-primary)] mb-8 animate-fade-up">
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
