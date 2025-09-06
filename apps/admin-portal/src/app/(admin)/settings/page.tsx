// --- apps/admin-portal/src/app/(admin)/settings/page.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import { database } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import '../content/content.css'; // Reusing the same styles
import ImageUploader from '@/components/ImageUploader';

interface FooterContent {
  copyrightText: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  poweredByText: string;
  poweredByLinkUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  customLinks?: { label: string; url: string; iconKey?: string }[];
  footerLogoUrl?: string;
}

interface BrandingContent {
  headerLogoUrl?: string;
}

const SettingsPage = () => {
  const [footer, setFooter] = useState<Partial<FooterContent>>({});
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<Partial<BrandingContent>>({});

  useEffect(() => {
    const footerRef = ref(database, 'siteContent/footer');
    const brandingRef = ref(database, 'siteContent/branding');

    const unsubscribeFooter = onValue(footerRef, (snapshot) => {
      setFooter(snapshot.val() || {});
    });
    const unsubscribeBranding = onValue(brandingRef, (snapshot) => {
      setBranding(snapshot.val() || {});
      setLoading(false);
    });
    
    return () => {
      unsubscribeFooter();
      unsubscribeBranding();
    };
  }, []);

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFooter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSaveFooter = async () => {
      const footerRef = ref(database, 'siteContent/footer');
      try {
          await update(footerRef, footer);
          alert('Footer settings updated successfully!');
      } catch (error) {
          alert('Failed to update footer settings.');
      }
  };

  const handleSaveBranding = async () => {
    const brandingRef = ref(database, 'siteContent/branding');
    try {
      await update(brandingRef, branding);
      alert('Branding settings updated successfully!');
    } catch (error) {
      alert('Failed to update branding settings.');
    }
  };

  const handleGrantAdmin = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('You must be signed in to grant admin.');
        return;
      }
      try {
        const fn = httpsCallable(getFunctions(), 'grantSelfAdmin');
        const res = await fn({});
        if ((res.data as any)?.success) {
          alert(`Granted admin to ${user.uid}`);
          return;
        }
      } catch (e) {
        // fallback to direct set if callable not yet deployed
        await set(ref(database, `siteConfig/admins/${user.uid}`), true);
        alert(`Granted admin to ${user.uid}`);
        return;
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to grant admin.');
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="page-container">
      <h1>Site Settings</h1>
      
      <div className="form-section">
        <h2>Footer Configuration</h2>
        
        <div className="form-group">
          <label htmlFor="copyrightText">Copyright Text</label>
          <input
            type="text"
            id="copyrightText"
            name="copyrightText"
            value={footer.copyrightText || ''}
            onChange={handleFooterChange}
            placeholder="© 2025 Your Company Name. All rights reserved."
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="facebookUrl">Facebook URL</label>
          <input
            type="url"
            id="facebookUrl"
            name="facebookUrl"
            value={footer.facebookUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://facebook.com/yourpage"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="youtubeUrl">YouTube URL</label>
          <input
            type="url"
            id="youtubeUrl"
            name="youtubeUrl"
            value={footer.youtubeUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://youtube.com/yourchannel"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tiktokUrl">TikTok URL</label>
          <input
            type="url"
            id="tiktokUrl"
            name="tiktokUrl"
            value={footer.tiktokUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://tiktok.com/@yourprofile"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="poweredByText">Powered By Text</label>
          <input
            type="text"
            id="poweredByText"
            name="poweredByText"
            value={footer.poweredByText || ''}
            onChange={handleFooterChange}
            placeholder="Powered by Your Technology Partner"
          />
        </div>

        <div className="form-group">
          <label htmlFor="poweredByLinkUrl">Powered By Link URL</label>
          <input
            type="url"
            id="poweredByLinkUrl"
            name="poweredByLinkUrl"
            value={footer.poweredByLinkUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://yourtechpartner.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="poweredByLinkUrl">Powered By Link URL</label>
          <input
            type="url"
            id="poweredByLinkUrl"
            name="poweredByLinkUrl"
            value={footer.poweredByLinkUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://yourtechpartner.com"
          />
        </div>
        <div className="form-group">
          <label>Footer Logo</label>
          <ImageUploader
            currentImageUrl={footer.footerLogoUrl}
            onUploadComplete={(url) => setFooter(prev => ({ ...prev, footerLogoUrl: url }))}
            resize={{ method: 'cover', width: 240, height: 120 }}
            uploadId="footer-logo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkedinUrl">LinkedIn URL</label>
          <input
            type="url"
            id="linkedinUrl"
            name="linkedinUrl"
            value={footer.linkedinUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="form-group">
          <label htmlFor="instagramUrl">Instagram URL</label>
          <input
            type="url"
            id="instagramUrl"
            name="instagramUrl"
            value={footer.instagramUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://instagram.com/yourprofile"
          />
        </div>

        <div className="form-group">
          <label htmlFor="xUrl">X (Twitter) URL</label>
          <input
            type="url"
            id="xUrl"
            name="xUrl"
            value={footer.xUrl || ''}
            onChange={handleFooterChange}
            placeholder="https://x.com/yourprofile"
          />
        </div>

        {/* Custom Links Manager */}
        <div className="form-group">
          <label>Custom Links</label>
          {(footer.customLinks || []).map((link, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Label"
                value={link.label || ''}
                onChange={(e) => {
                  const links = [...(footer.customLinks || [])];
                  links[idx] = { ...links[idx], label: e.target.value };
                  setFooter(prev => ({ ...prev, customLinks: links }));
                }}
              />
              <input
                type="url"
                placeholder="https://..."
                value={link.url || ''}
                onChange={(e) => {
                  const links = [...(footer.customLinks || [])];
                  links[idx] = { ...links[idx], url: e.target.value };
                  setFooter(prev => ({ ...prev, customLinks: links }));
                }}
              />
              <input
                type="text"
                placeholder="iconKey (optional)"
                value={link.iconKey || ''}
                onChange={(e) => {
                  const links = [...(footer.customLinks || [])];
                  links[idx] = { ...links[idx], iconKey: e.target.value };
                  setFooter(prev => ({ ...prev, customLinks: links }));
                }}
              />
              <button type="button" onClick={() => {
                const links = [...(footer.customLinks || [])];
                links.splice(idx, 1);
                setFooter(prev => ({ ...prev, customLinks: links }));
              }}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => {
            const links = [...(footer.customLinks || [])];
            links.push({ label: '', url: '', iconKey: '' });
            setFooter(prev => ({ ...prev, customLinks: links }));
          }}>+ Add Link</button>
        </div>
        
        <div className="form-actions">
          <button onClick={handleSaveFooter} className="action-button publish">
            Save Footer Settings
          </button>
            <button onClick={handleGrantAdmin} className="action-button" style={{ marginLeft: 12 }}>
              Grant Myself Admin
            </button>
        </div>
      </div>

      <div className="form-section">
        <h2>Branding Configuration</h2>
        <div className="form-group">
          <label>Header Logo</label>
          <ImageUploader
            currentImageUrl={branding.headerLogoUrl}
            onUploadComplete={(url) => setBranding(prev => ({ ...prev, headerLogoUrl: url }))}
            resize={{ method: 'cover', width: 240, height: 60 }}
            uploadId="header-logo"
          />
          <small>Recommended: 240x60 PNG with transparent background.</small>
        </div>
        <div className="form-group">
          <label>Footer Logo</label>
          <ImageUploader
            currentImageUrl={footer.footerLogoUrl}
            onUploadComplete={(url) => setFooter(prev => ({ ...prev, footerLogoUrl: url }))}
            resize={{ method: 'cover', width: 240, height: 120 }}
            uploadId="footer-logo"
          />
          <small>Recommended: 240x120 PNG or SVG.</small>
        </div>
        <div className="form-actions">
          <button onClick={handleSaveBranding} className="action-button publish">Save Branding</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;