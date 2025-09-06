// --- apps/admin-portal/src/app/(admin)/inquiries/page.tsx ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/firebase';
import './inquiries.css'; // We will create this stylesheet

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  businessPage?: string;
  status?: 'LEAD' | 'SELLER_INQUIRY'; // This is what Firebase actually stores
  type?: 'LEAD' | 'SELLER_INQUIRY'; // Legacy field support
  interestedProperty?: string;
  createdAt: number;
  notes?: string;
}

const InquiriesPage = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const inquiriesRef = ref(database, 'inquiries');
        const unsubscribe = onValue(inquiriesRef, (snapshot) => {
            const data = snapshot.val();
            const loadedInquiries: Inquiry[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                : [];
            setInquiries(loadedInquiries);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handlePromote = async (inquiry: Inquiry) => {
        if (window.confirm(`Are you sure you want to promote "${inquiry.firstName} ${inquiry.lastName}" to an Active Client?`)) {
            try {
                // Create the new client record with enhanced data
                const newClientData = {
                    firstName: inquiry.firstName,
                    lastName: inquiry.lastName,
                    email: inquiry.email || null,
                    phone: inquiry.phone || null,
                    businessPage: inquiry.businessPage || null,
                    interestedProperty: inquiry.interestedProperty || null,
                    originalInquiryType: inquiry.status || inquiry.type || 'UNKNOWN',
                    status: 'ACTIVE_CLIENT',
                    promotedAt: Date.now(),
                    notes: inquiry.notes || "Promoted from inquiry to active client",
                    profilePictureUrl: null, // Will be added later via EditClientModal
                };
                
                // Use a multi-path update to perform both actions atomically
                const updates: { [key: string]: any } = {};
                updates[`/clients/${inquiry.id}`] = newClientData; // Add to clients
                updates[`/inquiries/${inquiry.id}`] = null; // Remove from inquiries

                // Also create an activity log entry
                updates[`/events/${Date.now()}_${inquiry.id}`] = {
                    message: `${inquiry.firstName} ${inquiry.lastName} promoted to Active Client`,
                    timestamp: Date.now(),
                    type: "CLIENT_PROMOTED",
                    clientId: inquiry.id
                };

                await update(ref(database), updates);

                alert('Lead promoted successfully to Active Client!');
            } catch (error) {
                console.error("Error promoting lead:", error);
                alert("Failed to promote lead.");
            }
        }
    };

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(inquiry =>
            `${inquiry.firstName} ${inquiry.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (inquiry.email && inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [inquiries, searchQuery]);

    if (loading) return <p>Loading inquiries...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>New Inquiries</h1>
            </div>
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Inquiry Type</th>
                            <th>Date Received</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInquiries.length > 0 ? filteredInquiries.map(inquiry => (
                            <tr key={inquiry.id}>
                                <td>{inquiry.firstName} {inquiry.lastName}</td>
                                <td>{inquiry.email || inquiry.phone}</td>
                                <td>
                                    <span className={`type-badge ${(inquiry.status || inquiry.type)?.toLowerCase() || 'unknown'}`}>
                                        {(inquiry.status || inquiry.type)?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </td>
                                <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        className="action-button promote"
                                        onClick={() => handlePromote(inquiry)}
                                    >
                                        Promote to Active Client
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="no-results">No new inquiries.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InquiriesPage;