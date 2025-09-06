import React from 'react';
import type { AgentProfile as AgentProfileType } from '@repo/types';

export type AgentProfileStripProps = Partial<AgentProfileType> & {
  heading?: string;
};

export const AgentProfileStrip: React.FC<AgentProfileStripProps> = ({
  heading = 'Meet Your Advisor',
  name,
  title,
  portraitImageUrl,
  philosophy,
  contact,
}) => {
  if (!name && !philosophy) return null;
  return (
    <section style={{ marginTop: 40, padding: '24px', borderTop: '1px solid #e5e7eb' }}>
      <h2>{heading}</h2>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 12 }}>
        {portraitImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portraitImageUrl} alt={name} width={96} height={96} style={{ borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#eef2f7' }} />
        )}
        <div>
          {name && <div style={{ fontWeight: 700, fontSize: 18 }}>{name}</div>}
          {title && <div style={{ color: '#6b7280' }}>{title}</div>}
          {philosophy && <p style={{ marginTop: 8 }}>{philosophy}</p>}
          {contact && (contact.phone || contact.email) && (
            <div style={{ marginTop: 8, display: 'flex', gap: 12, color: '#0b6bcb' }}>
              {contact.phone && <a href={`tel:${contact.phone}`}>Call</a>}
              {contact.email && <a href={`mailto:${contact.email}`}>Email</a>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AgentProfileStrip;
