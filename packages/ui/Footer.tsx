// --- packages/ui/Footer.tsx ---
import React from 'react';

const footerStyles: React.CSSProperties = {
    width: '100%',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#0A2540',
    color: 'white',
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={footerStyles}>
        <p>© {currentYear} Property Pasalo. All Rights Reserved.</p>
        <p>Powered by Apex Platform</p>
    </footer>
  );
};