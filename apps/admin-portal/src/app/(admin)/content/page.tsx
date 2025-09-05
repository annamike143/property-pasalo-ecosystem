// --- apps/admin-portal/src/app/(admin)/content/page.tsx ---
'use client';
import React from 'react';
import LandingPageBuilder from '@/components/LandingPageBuilder';

const SiteContentPage = () => {
  return (
    <div>
      <h1>Site Content Management</h1>
      <LandingPageBuilder />
      {/* We will add other content managers like the Status Page manager here later */}
    </div>
  );
};

export default SiteContentPage;