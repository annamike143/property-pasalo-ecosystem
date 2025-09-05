// --- apps/admin-portal/src/app/(admin)/listings/page.tsx (FINAL) ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';
import Link from 'next/link';
import Image from 'next/image';
import './listings.css'; // We will create this stylesheet next

// TypeScript Interface for our Listing data
interface Listing {
  id: string;
  propertyName: string;
  location?: string;
  status: 'AVAILABLE' | 'SOLD' | 'DRAFT';
  cashOutPrice?: number;
  thumbnailImageUrl?: string;
}

const ListingsPage = () => {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'SOLD' | 'DRAFT'>('ALL');

    useEffect(() => {
        const listingsRef = ref(database, 'listings');
        const unsubscribe = onValue(listingsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedListings: Listing[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() 
                : [];
            setListings(loadedListings);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredListings = useMemo(() => {
        return listings
            .filter(listing => {
                if (statusFilter === 'ALL') return true;
                return listing.status === statusFilter;
            })
            .filter(listing => 
                listing.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (listing.location && listing.location.toLowerCase().includes(searchQuery.toLowerCase()))
            );
    }, [listings, searchQuery, statusFilter]);

    if (loading) return <p>Loading listings...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Listing Management</h1>
                <Link href="/listings/new" className="add-new-button">
                    + Add New Listing
                </Link>
            </div>
            
            <div className="controls-container">
                <input 
                    type="text"
                    placeholder="Search by property name or location..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="SOLD">Sold</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Thumbnail</th>
                            <th>Property Name & Location</th>
                            <th>Status</th>
                            <th>Cash-Out</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredListings.length > 0 ? filteredListings.map(listing => (
                            <tr key={listing.id}>
                                <td>
                                    <div className="thumbnail-container">
                                        {listing.thumbnailImageUrl ? (
                                            <Image src={listing.thumbnailImageUrl} alt={listing.propertyName} width={80} height={60} />
                                        ) : (
                                            <div className="thumbnail-placeholder">No Image</div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <strong>{listing.propertyName}</strong>
                                    <small>{listing.location || 'No location set'}</small>
                                </td>
                                <td><span className={`status-badge ${listing.status.toLowerCase()}`}>{listing.status}</span></td>
                                <td>{listing.cashOutPrice ? `₱${listing.cashOutPrice.toLocaleString()}` : 'N/A'}</td>
                                <td>
                                    <Link href={`/listings/edit/${listing.id}`} className="action-button edit">Edit</Link>
                                    <button className="action-button delete">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="no-results">No listings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListingsPage;