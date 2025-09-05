// --- apps/admin-portal/src/components/ListingBuilder.tsx (FINAL - Full Save Logic) ---
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, set, onValue } from 'firebase/database';
import { database } from '@/firebase';
import ImageUploader from './ImageUploader';
import TabbedInfoBuilder from './TabbedInfoBuilder';
import './ListingBuilder.css';

// --- Definitive TypeScript Interfaces ---
interface KeyValuePair { id: string; key: string; value: string; }
interface Tab { id: string; title: string; data: KeyValuePair[]; }
export interface ListingData {
    id?: string;
    propertyName: string;
    urlSlug: string;
    status: 'AVAILABLE' | 'SOLD' | 'DRAFT';
    tags: string[];
    cashOutPrice: number;
    location: string;
    thumbnailImageUrl: string | null;
    galleryImageUrls: string[];
    youtubeTourUrl: string;
    overviewDescription: string;
    tabbedInfo: Tab[];
    faqVideoHeadline: string;
    faqVideoUrl: string;
    featuredImageTestimonials: string[];
    featuredVideoTestimonials: string[];
}
const initialTabs: Tab[] = [
    { id: 'tab_1', title: 'Specs', data: [{ id: 'kv_1', key: 'Lot Area', value: '' }] },
    { id: 'tab_2', title: 'Location', data: [{ id: 'kv_2', key: 'Address', value: '' }] },
    { id: 'tab_3', title: 'Computation', data: [{ id: 'kv_3', key: 'Cash-Out', value: '' }] },
];
const initialState: ListingData = {
    propertyName: '', urlSlug: '', status: 'DRAFT', tags: [], cashOutPrice: 0, location: '',
    thumbnailImageUrl: null, galleryImageUrls: [], youtubeTourUrl: '', overviewDescription: '',
    tabbedInfo: initialTabs, faqVideoHeadline: '', faqVideoUrl: '',
    featuredImageTestimonials: [], featuredVideoTestimonials: []
};

// --- The Main Component ---
const ListingBuilder = ({ listingId }: { listingId?: string }) => {
    const [listingData, setListingData] = useState<ListingData>(initialState);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (listingId) {
            const listingRef = ref(database, `listings/${listingId}`);
            onValue(listingRef, (snapshot) => {
                if (snapshot.exists()) {
                    setListingData({ id: listingId, ...snapshot.val() });
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [listingId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let finalValue: string | number = value;
        if (name === 'cashOutPrice') {
            finalValue = value === '' ? 0 : parseInt(value, 10);
        }
        // Auto-generate slug from property name
        if (name === 'propertyName') {
            const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setListingData(prev => ({ ...prev, propertyName: value, urlSlug: slug }));
        } else {
            setListingData(prev => ({ ...prev, [name]: finalValue }));
        }
    };
    
    const handleThumbnailUpload = (url: string) => setListingData(prev => ({ ...prev, thumbnailImageUrl: url }));
    const setTabs = (newTabs: Tab[]) => setListingData(prev => ({ ...prev, tabbedInfo: newTabs }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (listingId) { // Update existing listing
                const listingRef = ref(database, `listings/${listingId}`);
                await set(listingRef, { ...listingData, id: undefined }); // Remove id before saving
            } else { // Create new listing
                const listingsRef = ref(database, 'listings');
                await push(listingsRef, listingData);
            }
            alert(`Listing successfully ${listingId ? 'updated' : 'created'}!`);
            router.push('/listings'); // Redirect back to the main list
        } catch (error) {
            console.error("Error saving listing:", error);
            alert("Failed to save listing. See console for details.");
        }
    };

    if (loading) return <p>Loading listing data...</p>;

    return (
        <div className="page-container">
            <form onSubmit={handleSubmit}>
                <div className="form-header">
                    <h1>{listingId ? 'Edit Listing' : 'Create New Listing'}</h1>
                    <div className="form-actions">
                        <button type="submit" className="action-button publish">Save & Publish</button>
                    </div>
                </div>
                {/* --- All Form Sections Go Here --- */}
                {/* For brevity, we'll just show one section, but you would build out the full form */}
                <div className="form-section">
                    <h2>Core Details</h2>
                    <div className="form-group">
                        <label htmlFor="propertyName">Property Name</label>
                        <input name="propertyName" type="text" value={listingData.propertyName} onChange={handleInputChange} required />
                    </div>
                     <div className="form-group">
                        <label htmlFor="urlSlug">URL Slug</label>
                        <input name="urlSlug" type="text" value={listingData.urlSlug} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select name="status" value={listingData.status} onChange={handleInputChange}>
                            <option value="DRAFT">Draft</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="SOLD">Sold</option>
                        </select>
                    </div>
                </div>
                <div className="form-section">
                    <h2>Photos & Video</h2>
                    <div className="form-group">
                        <label>Thumbnail Image</label>
                        <ImageUploader onUploadComplete={handleThumbnailUpload} currentImageUrl={listingData.thumbnailImageUrl} />
                    </div>
                </div>
                 <div className="form-section">
                    <h2>Tabbed Information Container</h2>
                    <TabbedInfoBuilder tabs={listingData.tabbedInfo} setTabs={setTabs} />
                </div>
            </form>
        </div>
    );
};

export default ListingBuilder;