// --- apps/public-site/src/app/listings/page.tsx (DEFINITIVE GALLERY) ---
import { database } from '@/firebase';
import { ref, get } from 'firebase/database';
import React from 'react';
import ListingCard from '@/components/ListingCard';
import { Footer } from '@repo/ui/footer';
import '../listings-home.css';

interface Listing {
  id: string;
  urlSlug: string;
  thumbnailImageUrl: string | null;
  propertyName: string;
  cashOutPrice: number;
  status: 'AVAILABLE' | 'SOLD';
}

async function getListings() {
    const listingsRef = ref(database, 'listings');
    const snapshot = await get(listingsRef);
    if (!snapshot.exists()) return { available: [], sold: [] };
    
    const allListings: Listing[] = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...(data as Omit<Listing, 'id'>) }));
    
    const available = allListings.filter(l => l.status === 'AVAILABLE').reverse();
    const sold = allListings.filter(l => l.status === 'SOLD').reverse();

    return { available, sold };
}

export default async function ListingsHomePage() {
    const { available, sold } = await getListings();

  return (
    <div>
        <section className="hero-listings">
            <div className="container">
                <h1>Hello Kabayan, Welcome to Property Pasalo</h1>
                <h2>Your Shortcut to Homeownership.</h2>
            </div>
        </section>
        
        <section className="listings-section">
            <div className="container">
                <h2 className="section-title">Available Properties</h2>
                {available.length > 0 ? (
                    <div className="listings-grid">
                        {available.map(listing => <ListingCard key={listing.id} slug={listing.urlSlug} thumbnailUrl={listing.thumbnailImageUrl} propertyName={listing.propertyName} cashOutPrice={listing.cashOutPrice} status={listing.status} />)}
                    </div>
                ) : (
                    <p>No available properties at the moment. Please check back soon!</p>
                )}

                {sold.length > 0 && (
                    <>
                        <h2 className="section-title sold-title">Recently Sold Properties</h2>
                        <div className="listings-grid">
                            {sold.map(listing => <ListingCard key={listing.id} slug={listing.urlSlug} thumbnailUrl={listing.thumbnailImageUrl} propertyName={listing.propertyName} cashOutPrice={listing.cashOutPrice} status={listing.status} />)}
                        </div>
                    </>
                )}
            </div>
        </section>
        
            {/* Footer is rendered globally in layout */}
    </div>
  );
}
