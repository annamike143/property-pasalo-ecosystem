// --- apps/admin-portal/src/app/(admin)/listings/edit/[id]/page.tsx ---
import ListingBuilder from '@/components/ListingBuilder';
import React from 'react';

interface EditListingPageProps {
    params: Promise<{
        id: string;
    }>;
}

const EditListingPage = async ({ params }: EditListingPageProps) => {
  const { id } = await params;
  return <ListingBuilder listingId={id} />;
};

export default EditListingPage;