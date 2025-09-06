'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  const segments = (pathname || '/').split('/').filter(Boolean);
  const parts = ['/', ...segments.map((_, i) => '/' + segments.slice(0, i + 1).join('/'))];

  return (
    <nav aria-label="Breadcrumb" style={{ padding: '0.5rem 2rem', fontSize: 14 }}>
      {parts.map((p, i) => {
        const label = p === '/' ? 'Home' : decodeURIComponent(p.split('/').slice(-1)[0] || '');
        const isLast = i === parts.length - 1;
        return (
          <span key={p}>
            {!isLast ? (
              <Link href={p} style={{ color: '#0b6bcb' }}>{label}</Link>
            ) : (
              <span aria-current="page" style={{ color: '#6b7280' }}>{label}</span>
            )}
            {!isLast && <span style={{ margin: '0 8px' }}>/</span>}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;