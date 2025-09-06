'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '@repo/ui/header';
import { LeadCaptureModal } from '@repo/ui/lead-capture-modal';
import { Breadcrumbs } from '@repo/ui';
import type { FormField } from '@repo/ui/lead-capture-modal';
import { functions, database } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { ref, get } from 'firebase/database';

// Minimal seller fields aligned with shared LeadCaptureModal
const sellerFields: FormField[] = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: false },
  { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
];

export default function PageClientWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    get(ref(database, 'siteContent/branding/headerLogoUrl')).then(s => {
      if (s.exists()) setHeaderLogoUrl(s.val() as string);
    }).catch(() => {});
  }, []);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleSubmit = async (data: Record<string, string>) => {
    // 1) Build payload and kick off both requests in parallel for performance
    const payload: Record<string, string> & { type: 'SELLER_INQUIRY' } = { ...data, type: 'SELLER_INQUIRY' } as const;
    const redirectSnapPromise = get(ref(database, 'siteContent/automationLinks/sellerSmartBotRedirectUrl'));
    const writePromise = (async () => {
      try {
        const writeLeadToDb = httpsCallable(functions, 'writeLeadToDb');
        const result = await writeLeadToDb(payload);
        return (result.data as { inquiryId?: string })?.inquiryId;
      } catch {
        const resp = await fetch('https://us-central1-property-pasalo-main.cloudfunctions.net/writeLeadToDbV2', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (resp.ok) { const json = await resp.json(); return (json as { inquiryId?: string })?.inquiryId; }
        return undefined;
      }
    })();

    const [snap, inquiryId] = await Promise.all([redirectSnapPromise, writePromise]);
    const baseUrl = snap.exists() ? (snap.val() as string) : '';
    if (baseUrl) {
      const url = new URL(baseUrl);
      if (inquiryId) url.searchParams.set('inquiryId', inquiryId);
      if (data.firstName) url.searchParams.set('firstName', data.firstName);
      if (data.lastName) url.searchParams.set('lastName', data.lastName);
      if (data.email) url.searchParams.set('email', data.email);
      if (data.phone) url.searchParams.set('phone', data.phone);
      window.location.href = url.toString();
    } else {
      close();
    }
  };

  return (
    <>
  <Header onCtaClick={open} listingsHref={(process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || '') + '/listings'} homeHref={process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || '/'} logoUrl={headerLogoUrl} />
      <Breadcrumbs />
      {children}
      <LeadCaptureModal
        isOpen={isOpen}
        onClose={close}
        title="Get Your Property Pasalo Consultation"
        fields={sellerFields}
        ctaText="Get My Free Consultation"
        onSubmit={handleSubmit}
      />
    </>
  );
}
