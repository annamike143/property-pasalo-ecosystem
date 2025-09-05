// --- apps/admin-portal/src/components/Sidebar.tsx ---
'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/inquiries', label: 'Inquiries' },
  { href: '/clients', label: 'Active Clients' },
  { href: '/homeowners', label: 'Homeowners' },
  { href: '/listings', label: 'Listings' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/content', label: 'Site Content' },
  { href: '/settings', label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <>
      <nav className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Property Pasalo</h3>
          <span>Admin Panel</span>
        </div>
        <ul className="sidebar-nav-list">
          {navItems.map(item => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={pathname === item.href ? 'active' : ''}
                onClick={handleLinkClick}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={handleOverlayClick}
        />
      )}
    </>
  );
};

export default Sidebar;