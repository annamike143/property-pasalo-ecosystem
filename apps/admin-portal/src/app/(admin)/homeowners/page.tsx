// --- apps/admin-portal/src/app/(admin)/homeowners/page.tsx ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';
import Image from 'next/image';
import { Client } from '../clients/page'; // Reusing the interface from the clients page
import './homeowners.css'; 

const HomeownersPage = () => {
    const [homeowners, setHomeowners] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const clientsRef = ref(database, 'clients');
        const unsubscribe = onValue(clientsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedClients: Client[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                : [];
            // We filter here to only show HOMEOWNER status
            setHomeowners(loadedClients.filter(c => c.status === 'HOMEOWNER'));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredHomeowners = useMemo(() => {
        return homeowners.filter(client =>
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [homeowners, searchQuery]);

    if (loading) return <p>Loading homeowners...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Homeowners</h1>
            </div>
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHomeowners.length > 0 ? filteredHomeowners.map(client => (
                            <tr key={client.id}>
                                <td>
                                    <div className="profile-pic-container">
                                        {client.profilePictureUrl ? (
                                            <Image src={client.profilePictureUrl} alt={`${client.firstName} ${client.lastName}`} width={40} height={40} />
                                        ) : (
                                            <div className="profile-pic-placeholder"></div>
                                        )}
                                    </div>
                                </td>
                                <td>{client.firstName} {client.lastName}</td>
                                <td>{client.email || client.phone}</td>
                                <td><span className="status-badge homeowner">{client.status}</span></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="no-results">No homeowners found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HomeownersPage;