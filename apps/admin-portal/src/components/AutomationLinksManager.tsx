// --- apps/admin-portal/src/components/AutomationLinksManager.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/firebase';

interface AutomationLinks {
  buyerRedirectUrl: string;
  sellerRedirectUrl: string;
}

const AutomationLinksManager = () => {
  const [links, setLinks] = useState<AutomationLinks>({
    buyerRedirectUrl: '',
    sellerRedirectUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const linksRef = ref(database, 'siteContent/automationLinks');
    const unsubscribe = onValue(linksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLinks(data);
      } else {
        // Set default links if none exist
        setLinks({
          buyerRedirectUrl: 'https://m.me/103746045078777?ref=CMTriVwqsfAN_220704',
          sellerRedirectUrl: 'https://m.me/103746045078777?ref=CMTriVwqsfAN_220704',
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const linksRef = ref(database, 'siteContent/automationLinks');
      await set(linksRef, links);
      alert('Automation links updated successfully!');
    } catch (error) {
      console.error('Error saving automation links:', error);
      alert('Failed to save automation links. Please try again.');
    }
    setSaving(false);
  };

  const handleInputChange = (field: keyof AutomationLinks, value: string) => {
    setLinks(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) return <p>Loading automation links...</p>;

  return (
    <div className="automation-links-manager">
      <h3>SmartBot Automation Links</h3>
      <p>Configure the Messenger links that users will be redirected to after submitting forms.</p>
      
      <div className="form-group">
        <label htmlFor="buyerRedirectUrl">
          <strong>Buyer Redirect URL</strong>
          <small>Used for "Book a Viewing" and property inquiry forms</small>
        </label>
        <input
          type="url"
          id="buyerRedirectUrl"
          value={links.buyerRedirectUrl}
          onChange={(e) => handleInputChange('buyerRedirectUrl', e.target.value)}
          placeholder="https://m.me/103746045078777?ref=BUYER_FLOW_REF"
          style={{ width: '100%', marginBottom: '1rem' }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="sellerRedirectUrl">
          <strong>Seller Redirect URL</strong>
          <small>Used for "Sell My Property" forms</small>
        </label>
        <input
          type="url"
          id="sellerRedirectUrl"
          value={links.sellerRedirectUrl}
          onChange={(e) => handleInputChange('sellerRedirectUrl', e.target.value)}
          placeholder="https://m.me/103746045078777?ref=SELLER_FLOW_REF"
          style={{ width: '100%', marginBottom: '1rem' }}
        />
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        style={{
          background: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: saving ? 'not-allowed' : 'pointer'
        }}
      >
        {saving ? 'Saving...' : 'Save Automation Links'}
      </button>

      <div style={{ marginTop: '1rem', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>How it works:</strong>
        <ol>
          <li>User submits a form on your public site</li>
          <li>Form data is saved to Firebase via writeLeadToDb function</li>
          <li>User is redirected to the appropriate Messenger link with their data</li>
          <li>Your SmartBot flow engages with the user</li>
          <li>SmartBot calls confirmLeadAndNotify webhook to confirm the lead</li>
          <li>You receive an email notification about the confirmed lead</li>
        </ol>
      </div>

      <div style={{ marginTop: '1rem', padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
        <strong>Your confirmLeadAndNotify Webhook URL:</strong>
        <br />
        <code style={{ background: 'white', padding: '4px', borderRadius: '2px' }}>
          https://us-central1-property-pasalo-main.cloudfunctions.net/confirmLeadAndNotify
        </code>
        <br />
        <small>Use this URL in your SmartBot webhook card with POST method</small>
      </div>
    </div>
  );
};

export default AutomationLinksManager;
