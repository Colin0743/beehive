'use client';

import React, { ReactNode } from 'react';
import { Container } from 'semantic-ui-react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8" style={{ marginTop: '60px' }}>
        <Container>
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {title}
            </h1>
          )}
          {children}
        </Container>
      </main>
    </div>
  );
}
