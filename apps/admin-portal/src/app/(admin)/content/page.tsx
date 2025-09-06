// --- apps/admin-portal/src/app/(admin)/content/page.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/firebase';
import type { Testimonial as TestimonialType, Listing as ListingType } from '@repo/types';
import LandingPageBuilder from '@/components/LandingPageBuilder';
import AutomationLinksManager from '@/components/AutomationLinksManager';
import './content.css';

type CuratedIds = string[];

interface SiteContentState {
  homepage: {
    featuredImageTestimonials: CuratedIds;
    featuredVideoTestimonials: CuratedIds;
  };
  statusPage: {
    featuredImageTestimonials: CuratedIds;
    featuredVideoTestimonials: CuratedIds;
    featuredListingIds: CuratedIds;
  };
}

const SiteContentPage = () => {
  const [content, setContent] = useState<Partial<SiteContentState>>({});
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [listings, setListings] = useState<Array<ListingType & { id: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const homepageRef = ref(database, 'siteContent/homepage');
    const statusRef = ref(database, 'siteContent/statusPage');
    const testimonialsRef = ref(database, 'testimonials');
    const listingsRef = ref(database, 'listings');

    const unsubHomepage = onValue(homepageRef, (snapshot) => {
      const v = snapshot.val();
      setContent(prev => ({
        ...prev,
        homepage: {
          featuredImageTestimonials: v?.featuredImageTestimonials || [],
          featuredVideoTestimonials: v?.featuredVideoTestimonials || [],
        }
      }));
    });
    const unsubStatus = onValue(statusRef, (snapshot) => {
      const v = snapshot.val();
      setContent(prev => ({
        ...prev,
        statusPage: {
          featuredImageTestimonials: v?.featuredImageTestimonials || [],
          featuredVideoTestimonials: v?.featuredVideoTestimonials || [],
          featuredListingIds: v?.featuredListingIds || [],
        }
      }));
    });
    const unsubTestimonials = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      const loaded: TestimonialType[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [] as any;
      setTestimonials(loaded);
      setLoading(false);
    });
    const unsubListings = onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      const loaded = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setListings(loaded);
    });

    return () => {
      unsubHomepage();
      unsubStatus();
      unsubTestimonials();
      unsubListings();
    };
  }, []);

  const saveHomepage = async () => {
    try {
      await set(ref(database, 'siteContent/homepage'), content.homepage || { featuredImageTestimonials: [], featuredVideoTestimonials: [] });
      alert('Homepage curated testimonials saved.');
    } catch {
      alert('Failed to save homepage settings.');
    }
  };

  const saveStatusPage = async () => {
    try {
      await set(ref(database, 'siteContent/statusPage'), content.statusPage || { featuredImageTestimonials: [], featuredVideoTestimonials: [], featuredListingIds: [] });
      alert('Status page curated settings saved.');
    } catch {
      alert('Failed to save status page settings.');
    }
  };

  const onSelectChange = (path: 'homepage' | 'statusPage', key: keyof SiteContentState['homepage'] | keyof SiteContentState['statusPage']) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
    setContent(prev => ({
      ...prev,
      [path]: { ...(prev as any)[path], [key]: selectedIds }
    }));
  };

  if (loading) return <p>Loading site content...</p>;

  const imageTestimonials = testimonials.filter(t => t.type === 'IMAGE');
  const videoTestimonials = testimonials.filter(t => t.type === 'VIDEO');

  return (
    <div className="page-container">
      <h1>Site Content Management</h1>

      <div className="form-section">
        <h2>Homepage Settings</h2>
        <div className="form-group">
          <label htmlFor="homeImageT">Featured Image Testimonials</label>
          <select id="homeImageT" multiple className="multi-select"
            value={content.homepage?.featuredImageTestimonials || []}
            onChange={onSelectChange('homepage', 'featuredImageTestimonials')}>
            {imageTestimonials.map(t => (
              <option key={t.id} value={t.id!}>{t.clientName} – {(t.quote || '').slice(0,30)}{(t.quote||'').length>30?'...':''}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="homeVideoT">Featured Video Testimonials</label>
          <select id="homeVideoT" multiple className="multi-select"
            value={content.homepage?.featuredVideoTestimonials || []}
            onChange={onSelectChange('homepage', 'featuredVideoTestimonials')}>
            {videoTestimonials.map(t => (
              <option key={t.id} value={t.id!}>{t.clientName} – {t.videoTitle}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button onClick={saveHomepage} className="action-button publish">Save Homepage Settings</button>
        </div>
      </div>

      <div className="form-section">
        <h2>Status Page Settings</h2>
        <div className="form-group">
          <label htmlFor="statusImageT">Featured Image Testimonials</label>
          <select id="statusImageT" multiple className="multi-select"
            value={content.statusPage?.featuredImageTestimonials || []}
            onChange={onSelectChange('statusPage', 'featuredImageTestimonials')}>
            {imageTestimonials.map(t => (
              <option key={t.id} value={t.id!}>{t.clientName} – {(t.quote || '').slice(0,30)}{(t.quote||'').length>30?'...':''}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="statusVideoT">Featured Video Testimonials</label>
          <select id="statusVideoT" multiple className="multi-select"
            value={content.statusPage?.featuredVideoTestimonials || []}
            onChange={onSelectChange('statusPage', 'featuredVideoTestimonials')}>
            {videoTestimonials.map(t => (
              <option key={t.id} value={t.id!}>{t.clientName} – {t.videoTitle}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="statusListings">Featured Listing IDs</label>
          <select id="statusListings" multiple className="multi-select"
            value={content.statusPage?.featuredListingIds || []}
            onChange={onSelectChange('statusPage', 'featuredListingIds' as any)}>
            {listings.map(l => (
              <option key={l.id} value={l.id}>{l.propertyName}</option>
            ))}
          </select>
          <div className="field-description">Hold Ctrl (Cmd on Mac) to select multiple items.</div>
        </div>
        <div className="form-actions">
          <button onClick={saveStatusPage} className="action-button publish">Save Status Page Settings</button>
        </div>
      </div>

      <div className="form-section">
        <h2>Automation Links</h2>
        <AutomationLinksManager />
      </div>

      <div className="form-section">
        <h2>Landing Page Content</h2>
        <LandingPageBuilder />
      </div>
    </div>
  );
};

export default SiteContentPage;