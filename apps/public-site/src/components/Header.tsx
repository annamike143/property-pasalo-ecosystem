// --- apps/public-site/src/components/Header.tsx ---
'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Header.css';

interface HeaderProps {
  onCtaClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCtaClick }) => {
  return (
    <header className="header">
      <div className="container header-container">
        <Link href="/">
          <Image src="/logo-wordmark.svg" alt="Property Pasalo Logo" width={160} height={40} className="logo"/>
        </Link>
        <nav className="header-nav">
          <Link href="/listings" className="nav-link">View All Listings</Link>
          <button onClick={onCtaClick} className="sell-button">Sell My Property</button>
        </nav>
      </div>
    </header>
  );
};
export default Header;