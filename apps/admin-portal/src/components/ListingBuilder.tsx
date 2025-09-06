// --- apps/admin-portal/src/components/ListingBuilder.tsx (DEFINITIVE FINAL) ---
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ref, push, set, onValue } from 'firebase/database';
import { database } from '@/firebase';
import ImageUploader from './ImageUploader';
import TabbedInfoBuilder from './TabbedInfoBuilder';
import { Testimonial } from '../app/(admin)/testimonials/page';
import { Agent } from '../app/(admin)/agents/page';
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
    assignedAgentId?: string;
    assignedAgentName?: string;
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
    const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
    const [allAgents, setAllAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch testimonials for the dropdowns
        const testimonialsRef = ref(database, 'testimonials');
        onValue(testimonialsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedTestimonials: Testimonial[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setAllTestimonials(loadedTestimonials);
        });

        // Fetch agents for the dropdown
        const agentsRef = ref(database, 'agents');
        onValue(agentsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedAgents: Agent[] = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setAllAgents(loadedAgents.filter(agent => agent.status === 'ACTIVE'));
        });

        if (listingId) {
            const listingRef = ref(database, `listings/${listingId}`);
            onValue(listingRef, (snapshot) => {
                if (snapshot.exists()) {
                    // Ensure all fields have a default value to prevent uncontrolled component errors
                    const fetchedData = snapshot.val();
                    const completeData = { ...initialState, ...fetchedData, id: listingId };
                    setListingData(completeData);
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [listingId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let finalValue: string | number | string[] = value;
        if (name === 'cashOutPrice') {
            finalValue = value === '' ? 0 : parseInt(value, 10);
        }
        if (name === 'featuredImageTestimonials' || name === 'featuredVideoTestimonials') {
            const selectElement = e.target as HTMLSelectElement;
            const options = selectElement.options;
            const selectedValues = [];
            for (let i = 0, l = options.length; i < l; i++) {
                if (options[i].selected) {
                    selectedValues.push(options[i].value);
                }
            }
            finalValue = selectedValues;
        }
        
        // Handle agent selection
        if (name === 'assignedAgentId') {
            const selectedAgent = allAgents.find(agent => agent.id === value);
            setListingData(prev => ({ 
                ...prev, 
                assignedAgentId: value,
                assignedAgentName: selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName}` : ''
            }));
            return;
        }
        
        if (name === 'propertyName' && !listingId) { // Only auto-slug for new listings
            const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            setListingData(prev => ({ ...prev, propertyName: value, urlSlug: slug }));
        } else {
            setListingData(prev => ({ ...prev, [name]: finalValue }));
        }
    };
    
    const handleThumbnailUpload = (url: string) => setListingData(prev => ({ ...prev, thumbnailImageUrl: url }));
    
    // Gallery image handlers
    const handleGalleryUpload = (url: string, index: number) => {
        setListingData(prev => {
            const newGalleryUrls = [...prev.galleryImageUrls];
            newGalleryUrls[index] = url;
            return { ...prev, galleryImageUrls: newGalleryUrls };
        });
    };
    
    const addGallerySlot = () => {
        setListingData(prev => ({
            ...prev,
            galleryImageUrls: [...prev.galleryImageUrls, '']
        }));
    };
    
    const removeGalleryImage = (index: number) => {
        setListingData(prev => ({
            ...prev,
            galleryImageUrls: prev.galleryImageUrls.filter((_, i) => i !== index)
        }));
    };
    const setTabs = (newTabs: Tab[]) => setListingData(prev => ({ ...prev, tabbedInfo: newTabs }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const dataToSave = { ...listingData };
            
            if (listingId) {
                // Editing existing listing - remove id field before saving
                const { id, ...listingDataWithoutId } = dataToSave;
                const listingRef = ref(database, `listings/${listingId}`);
                await set(listingRef, listingDataWithoutId);
                alert('Listing updated successfully!');
            } else {
                // Creating new listing
                const { id, ...listingDataWithoutId } = dataToSave;
                const listingsRef = ref(database, 'listings');
                await push(listingsRef, listingDataWithoutId);
                alert('Listing created successfully!');
            }
            
            // Navigate back to listings page
            router.push('/listings');
        } catch (error) {
            console.error('Error saving listing:', error);
            alert('Failed to save listing. Please try again.');
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
                        <label htmlFor="location">Location</label>
                        <input name="location" type="text" value={listingData.location} onChange={handleInputChange} required />
                    </div>
                     <div className="form-group">
                        <label htmlFor="cashOutPrice">Cash-Out Price (in PHP)</label>
                        <input name="cashOutPrice" type="number" value={listingData.cashOutPrice} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select name="status" value={listingData.status} onChange={handleInputChange}>
                            <option value="DRAFT">Draft</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="SOLD">Sold</option>
                        </select>
                    </div>
                     <div className="form-group">
                        <label htmlFor="overviewDescription">Property Overview</label>
                        <textarea name="overviewDescription" value={listingData.overviewDescription} onChange={handleInputChange} rows={6}></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="assignedAgentId">Assigned Agent</label>
                        <select 
                            name="assignedAgentId" 
                            value={listingData.assignedAgentId || ''} 
                            onChange={handleInputChange}
                        >
                            <option value="">No Agent Assigned</option>
                            {allAgents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.firstName} {agent.lastName} - {agent.email}
                                </option>
                            ))}
                        </select>
                        {listingData.assignedAgentName && (
                            <small className="agent-info">
                                Assigned to: {listingData.assignedAgentName}
                            </small>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <h2>Photos & Video</h2>
                    <div className="form-group">
                        <label>Thumbnail Image</label>
                        <ImageUploader 
                            uploadId="thumbnail"
                            onUploadComplete={handleThumbnailUpload} 
                            currentImageUrl={listingData.thumbnailImageUrl} 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Gallery Images (Additional Photos)</label>
                        <div className="gallery-uploader">
                            {listingData.galleryImageUrls.map((imageUrl, index) => (
                                <div key={index} className="gallery-item">
                                    <ImageUploader 
                                        uploadId={`gallery-${index}`}
                                        onUploadComplete={(url) => handleGalleryUpload(url, index)} 
                                        currentImageUrl={imageUrl} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeGalleryImage(index)}
                                        className="remove-gallery-btn"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={addGallerySlot}
                                className="add-gallery-btn"
                            >
                                + Add Gallery Image
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="youtubeTourUrl">YouTube Tour URL</label>
                        <input name="youtubeTourUrl" type="url" value={listingData.youtubeTourUrl} onChange={handleInputChange} placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                </div>
                
                <div className="form-section">
                    <h2>Tabbed Information Container</h2>
                    <TabbedInfoBuilder tabs={listingData.tabbedInfo} setTabs={setTabs} />
                </div>

                <div className="form-section">
                    <h2>FAQ & Objection Video</h2>
                    <div className="form-group">
                        <label htmlFor="faqVideoHeadline">Video Section Headline</label>
                        <input name="faqVideoHeadline" type="text" value={listingData.faqVideoHeadline} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="faqVideoUrl">FAQ YouTube URL</label>
                        <input name="faqVideoUrl" type="url" value={listingData.faqVideoUrl} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Testimonial Selection</h2>
                    <div className="form-group">
                        <label htmlFor="featuredImageTestimonials">Featured Image Testimonials (Hold Ctrl/Cmd to select multiple)</label>
                        <select name="featuredImageTestimonials" multiple value={listingData.featuredImageTestimonials} onChange={handleInputChange} className="multi-select">
                            {allTestimonials.filter(t => t.type === 'IMAGE').map(t => <option key={t.id} value={t.id}>{t.clientName}</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label htmlFor="featuredVideoTestimonials">Featured Video Testimonials</label>
                        <select name="featuredVideoTestimonials" multiple value={listingData.featuredVideoTestimonials} onChange={handleInputChange} className="multi-select">
                            {allTestimonials.filter(t => t.type === 'VIDEO').map(t => <option key={t.id} value={t.id}>{t.videoTitle}</option>)}
                        </select>
                    </div>
                </div>

            </form>
        </div>
    );
};
export default ListingBuilder;