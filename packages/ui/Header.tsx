// --- packages/ui/Header.tsx ---
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// A generic styling object for now. We will add a shared CSS module later.
const headerStyles: React.CSSProperties = {
    width: '100%',
    padding: '1rem 2rem',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
};
const navStyles: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
};

export interface HeaderProps {
        onCtaClick?: () => void;
        ctaText?: string;
        homeHref?: string;
        listingsHref?: string;
        logoUrl?: string; // optional custom logo
}

export const Header: React.FC<HeaderProps> = ({ onCtaClick, ctaText = 'Sell My Property', homeHref = '/', listingsHref = '/listings', logoUrl }) => {
  return (
    <header style={headerStyles}>
                <Link href={homeHref}>
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="Property Pasalo" width={160} height={40} style={{ objectFit: 'contain' }} />
                        ) : (
                            <span>Property Pasalo Logo</span>
                        )}
                </Link>
        <nav style={navStyles}>
                        <Link href={listingsHref} style={{ padding: '0.5rem 0.75rem' }}>View All Listings</Link>
                        <button onClick={onCtaClick} aria-label={ctaText} style={{ padding: '0.6rem 1rem', background: '#0B6E4F', color: 'white', border: 'none', borderRadius: 6 }}>
                            {ctaText}
                        </button>
        </nav>
    </header>
  );
};