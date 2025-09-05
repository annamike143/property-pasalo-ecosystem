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

export const Header = () => {
  return (
    <header style={headerStyles}>
        <Link href="/">
            {/* We need to add the logo to the public-site app's public folder later */}
            {/* <Image src="/logo-wordmark.png" alt="Property Pasalo" width={150} height={40} /> */}
            <span>Property Pasalo Logo</span>
        </Link>
        <nav style={navStyles}>
            <Link href="/listings">View All Listings</Link>
            <button>Sell My Property</button>
        </nav>
    </header>
  );
};