import React from 'react';
import Image from 'next/image';

export interface BaseTestimonial {
  id?: string;
  type: 'IMAGE' | 'VIDEO';
  clientName: string;
  clientTitle?: string;
  clientPhotoUrl?: string;
  quote?: string;
  rating?: number;
  badge?: string;
  videoTitle?: string;
  youtubeId?: string;
}

export const TestimonialCard: React.FC<{ t: BaseTestimonial }> = ({ t }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '16px 16px 12px',
      background: '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        {t.clientPhotoUrl ? (
          <Image alt={t.clientName} src={t.clientPhotoUrl} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eef2f7' }} />
        )}
        <div>
          <div style={{ fontWeight: 600 }}>{t.clientName}</div>
          {t.clientTitle && <div style={{ color: '#6b7280', fontSize: 12 }}>{t.clientTitle}</div>}
        </div>
      </div>
      {t.type === 'IMAGE' ? (
        <>
          {t.quote && (
            <div style={{ color: '#111827', fontStyle: 'italic', marginBottom: 8 }}>
              “{t.quote}”
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {typeof t.rating === 'number' && (
              <div style={{ color: '#f59e0b' }} aria-label={`${t.rating} stars`}>
                {'★'.repeat(t.rating)}{'☆'.repeat(Math.max(0, 5 - t.rating))}
              </div>
            )}
            {t.badge && (
              <span style={{ fontSize: 12, color: '#0b6bcb', background: '#e6f1fc', padding: '2px 8px', borderRadius: 999 }}>{t.badge}</span>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 500 }}>{t.videoTitle || 'Video Testimonial'}</div>
          {t.youtubeId && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>YouTube ID: {t.youtubeId}</div>
          )}
        </>
      )}
    </div>
  );
};

export default TestimonialCard;
