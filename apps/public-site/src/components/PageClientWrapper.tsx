// --- apps/public-site/src/components/PageClientWrapper.tsx (DEFINITIVE FINAL) ---
'use client';
import React, { useState, Children, cloneElement, isValidElement, useEffect } from 'react';
import { Header } from '@repo/ui/header';
import { LeadCaptureModal } from '@repo/ui/lead-capture-modal';
import { Breadcrumbs } from '@repo/ui';
import type { FormField } from '@repo/ui/lead-capture-modal';
import { functions, database } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { ref, get } from 'firebase/database';


const fields: FormField[] = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: false },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
];

export const PageClientWrapper = ({ children }: { children: React.ReactNode }) => {
                const [isModalOpen, setIsModalOpen] = useState(false);
                const [submitting, setSubmitting] = useState(false);
                const [headerLogoUrl, setHeaderLogoUrl] = useState<string | undefined>(undefined);
                useEffect(() => {
                        get(ref(database, 'siteContent/branding/headerLogoUrl'))
                            .then(s => { if (s.exists()) setHeaderLogoUrl(s.val() as string); })
                            .catch(() => {});
                }, []);
        const openModal = () => setIsModalOpen(true);
        const closeModal = () => setIsModalOpen(false);

        const onSubmit = async (data: Record<string, string>) => {
            if (submitting) return; // prevent duplicates
            setSubmitting(true);
            try {
                let inquiryId: string | undefined;
                const payload = { ...data, type: 'SELLER_INQUIRY' } as const;
                try {
                    const writeLeadToDb = httpsCallable(functions, 'writeLeadToDb');
                    const result = await writeLeadToDb(payload);
                    const resData = result.data as { inquiryId?: string };
                    inquiryId = resData?.inquiryId;
                } catch {
                    const resp = await fetch('https://us-central1-property-pasalo-main.cloudfunctions.net/writeLeadToDbV2', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                    });
                    if (resp.ok) {
                        const json = await resp.json();
                        inquiryId = json?.inquiryId;
                    }
                }
                const snap = await get(ref(database, 'siteContent/automationLinks/sellerSmartBotRedirectUrl'));
                const base = snap.exists() ? (snap.val() as string) : '';
                if (base) {
                    const url = new URL(base);
                    if (inquiryId) url.searchParams.set('inquiryId', inquiryId);
                    if (data.firstName) url.searchParams.set('firstName', data.firstName);
                    if (data.lastName) url.searchParams.set('lastName', data.lastName);
                    if (data.email) url.searchParams.set('email', data.email);
                    if (data.phone) url.searchParams.set('phone', data.phone);
                    window.location.href = url.toString();
                } else {
                    closeModal();
                }
            } finally {
                // keep submitting flag until navigation or close to prevent rapid re-clicks
                setTimeout(() => setSubmitting(false), 1500);
            }
        };

    const childrenWithProps = Children.map(children, child => {
        if (isValidElement(child)) {
            // We are looking for components that need the onCtaClick function
            // and cloning them with the new prop.
            return cloneElement(child as React.ReactElement<{onCtaClick?: () => void}>, { onCtaClick: openModal });
        }
        return child;
    });

        return (
                <>
                        <Header
                            onCtaClick={openModal}
                            homeHref={process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || '/'}
                            listingsHref={(process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || '') + '/listings'}
                            logoUrl={headerLogoUrl}
                        />
                        <Breadcrumbs />
                        {childrenWithProps}
                        <LeadCaptureModal
                            isOpen={isModalOpen}
                            onClose={closeModal}
                            title="Get Your Property Pasalo Consultation"
                            fields={fields}
                            ctaText={submitting ? 'Submitting…' : 'Get My Free Consultation'}
                            onSubmit={onSubmit}
                        />
                </>
        );
};