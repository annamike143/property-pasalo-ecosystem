// --- apps/admin-portal/src/app/(admin)/clients/page.tsx (FINAL) ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';
import EditClientModal from '@/components/EditClientModal';
import './clients.css'; 

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'ACTIVE_CLIENT' | 'HOMEOWNER';
  profilePictureUrl?: string;
  notes?: string;
}

const ActiveClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        const clientsRef = ref(database, 'clients');
        const unsubscribe = onValue(clientsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedClients: Client[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                : [];
            setClients(loadedClients.filter(c => c.status === 'ACTIVE_CLIENT'));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [clients, searchQuery]);

    if (loading) return <p>Loading active clients...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Active Clients</h1>
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
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.length > 0 ? filteredClients.map(client => (
                            <tr key={client.id}>
                                <td>{client.firstName} {client.lastName}</td>
                                <td>{client.email || client.phone}</td>
                                <td>
                                    <button 
                                        className="action-button edit"
                                        onClick={() => setSelectedClient(client)}
                                    >
                                        Edit / View Details
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="no-results">No active clients found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {selectedClient && (
                <EditClientModal 
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                />
            )}
        </div>
    );
};

export default ActiveClientsPage;