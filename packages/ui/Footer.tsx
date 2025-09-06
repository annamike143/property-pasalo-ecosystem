// --- packages/ui/Footer.tsx ---
import React from 'react';
import { FaFacebook, FaYoutube, FaTiktok, FaLinkedin, FaInstagram, FaXTwitter, FaLink } from 'react-icons/fa6';

const footerStyles: React.CSSProperties = {
    width: '100%',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#0A2540',
    color: 'white',
};

export interface FooterContentProps {
  copyrightText?: string;
  poweredByText?: string;
  poweredByLinkUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  customLinks?: { label: string; url: string; iconKey?: string }[];
  footerLogoUrl?: string;
}

export const Footer: React.FC<FooterContentProps> = ({
  copyrightText,
  poweredByText = 'Powered by Apex Platform',
  poweredByLinkUrl,
  facebookUrl,
  youtubeUrl,
  tiktokUrl,
  linkedinUrl,
  instagramUrl,
  xUrl,
  customLinks,
  footerLogoUrl,
}) => {
  const currentYear = new Date().getFullYear();
  const iconStyle: React.CSSProperties = { color: 'white', marginRight: '0.75rem', verticalAlign: 'middle' };
  const renderIconLink = (url: string, icon: React.ReactNode, label: string) => (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', marginRight: '1rem' }} aria-label={label}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>{icon}<span style={{ textDecoration: 'underline' }}>{label}</span></span>
    </a>
  );
  const renderCustomIcon = (key?: string) => {
    switch ((key || '').toLowerCase()) {
      case 'facebook': return <FaFacebook style={iconStyle} />;
      case 'youtube': return <FaYoutube style={iconStyle} />;
      case 'tiktok': return <FaTiktok style={iconStyle} />;
      case 'linkedin': return <FaLinkedin style={iconStyle} />;
      case 'instagram': return <FaInstagram style={iconStyle} />;
      case 'x':
      case 'twitter': return <FaXTwitter style={iconStyle} />;
      default: return <FaLink style={iconStyle} />;
    }
  };
  return (
    <footer style={footerStyles}>
        {footerLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={footerLogoUrl} alt="Footer Logo" width={120} height={60} style={{ objectFit: 'contain', marginBottom: '0.5rem' }} />
        )}
        <p>{copyrightText || `\u00a9 ${currentYear} Property Pasalo. All Rights Reserved.`}</p>
        {poweredByLinkUrl ? (
          <p><a href={poweredByLinkUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>{poweredByText}</a></p>
        ) : (
          <p>{poweredByText}</p>
        )}
        <p>
          {facebookUrl && renderIconLink(facebookUrl, <FaFacebook style={iconStyle} />, 'Facebook')}
          {youtubeUrl && renderIconLink(youtubeUrl, <FaYoutube style={iconStyle} />, 'YouTube')}
          {tiktokUrl && renderIconLink(tiktokUrl, <FaTiktok style={iconStyle} />, 'TikTok')}
          {linkedinUrl && renderIconLink(linkedinUrl, <FaLinkedin style={iconStyle} />, 'LinkedIn')}
          {instagramUrl && renderIconLink(instagramUrl, <FaInstagram style={iconStyle} />, 'Instagram')}
          {xUrl && renderIconLink(xUrl, <FaXTwitter style={iconStyle} />, 'X')}
          {customLinks?.map((l: { label: string; url: string; iconKey?: string }, i: number) => renderIconLink(l.url, renderCustomIcon(l.iconKey), l.label))}
        </p>
    </footer>
  );
};