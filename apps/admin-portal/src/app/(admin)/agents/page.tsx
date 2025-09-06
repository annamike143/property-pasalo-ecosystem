// --- apps/admin-portal/src/app/(admin)/agents/page.tsx ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { database } from '@/firebase';
import Image from 'next/image';
import './agents.css';

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
  bio?: string;
  specialties?: string[];
  license?: string;
  experience?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

const AgentsPage = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [formData, setFormData] = useState<Partial<Agent>>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        specialties: [],
        license: '',
        experience: 0,
        status: 'ACTIVE'
    });

    useEffect(() => {
        const agentsRef = ref(database, 'agents');
        const unsubscribe = onValue(agentsRef, (snapshot) => {
            const data = snapshot.val();
            const loadedAgents: Agent[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] }))
                : [];
            setAgents(loadedAgents);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredAgents = useMemo(() => {
        return agents.filter(agent =>
            `${agent.firstName} ${agent.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [agents, searchQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'specialties') {
            setFormData(prev => ({ ...prev, specialties: value.split(',').map(s => s.trim()) }));
        } else if (name === 'experience') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const timestamp = new Date().toISOString();
            
            if (editingAgent) {
                // Update existing agent
                const agentRef = ref(database, `agents/${editingAgent.id}`);
                await update(agentRef, {
                    ...formData,
                    updatedAt: timestamp
                });
                alert('Agent updated successfully!');
            } else {
                // Create new agent
                const agentsRef = ref(database, 'agents');
                await push(agentsRef, {
                    ...formData,
                    createdAt: timestamp,
                    updatedAt: timestamp
                });
                alert('Agent created successfully!');
            }
            
            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                bio: '',
                specialties: [],
                license: '',
                experience: 0,
                status: 'ACTIVE'
            });
            setShowForm(false);
            setEditingAgent(null);
        } catch (error) {
            console.error('Error saving agent:', error);
            alert('Failed to save agent. Please try again.');
        }
    };

    const handleEdit = (agent: Agent) => {
        setFormData(agent);
        setEditingAgent(agent);
        setShowForm(true);
    };

    const handleDelete = async (agentId: string, agentName: string) => {
        if (!confirm(`Are you sure you want to delete agent "${agentName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const agentRef = ref(database, `agents/${agentId}`);
            await remove(agentRef);
            alert('Agent deleted successfully!');
        } catch (error) {
            console.error('Error deleting agent:', error);
            alert('Failed to delete agent. Please try again.');
        }
    };

    const cancelEdit = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            bio: '',
            specialties: [],
            license: '',
            experience: 0,
            status: 'ACTIVE'
        });
        setShowForm(false);
        setEditingAgent(null);
    };

    if (loading) return <p>Loading agents...</p>;

    return (
        <div className="agents-page">
            <div className="page-header">
                <h1>Agent Management</h1>
                <button 
                    className="add-agent-btn"
                    onClick={() => setShowForm(true)}
                >
                    + Add New Agent
                </button>
            </div>

            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Search agents by name or email..."
                    className="search-bar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {showForm && (
                <div className="agent-form-overlay">
                    <div className="agent-form">
                        <h2>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone *</label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="license">License Number</label>
                                    <input
                                        type="text"
                                        id="license"
                                        name="license"
                                        value={formData.license || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="experience">Years of Experience</label>
                                    <input
                                        type="number"
                                        id="experience"
                                        name="experience"
                                        value={formData.experience || 0}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={formData.status || 'ACTIVE'}
                                        onChange={handleInputChange}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="specialties">Specialties (comma-separated)</label>
                                    <input
                                        type="text"
                                        id="specialties"
                                        name="specialties"
                                        value={formData.specialties?.join(', ') || ''}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Residential, Commercial, Investment Properties"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label htmlFor="bio">Bio</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        value={formData.bio || ''}
                                        onChange={handleInputChange}
                                        placeholder="Brief professional bio..."
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={cancelEdit} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingAgent ? 'Update Agent' : 'Create Agent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="agents-grid">
                {filteredAgents.length > 0 ? filteredAgents.map(agent => (
                    <div key={agent.id} className="agent-card">
                        <div className="agent-photo">
                            {agent.profilePictureUrl ? (
                                <Image 
                                    src={agent.profilePictureUrl} 
                                    alt={`${agent.firstName} ${agent.lastName}`}
                                    width={100}
                                    height={100}
                                />
                            ) : (
                                <div className="agent-placeholder">
                                    {agent.firstName[0]}{agent.lastName[0]}
                                </div>
                            )}
                        </div>
                        <div className="agent-info">
                            <h3>{agent.firstName} {agent.lastName}</h3>
                            <p className="agent-contact">{agent.email}</p>
                            <p className="agent-contact">{agent.phone}</p>
                            {agent.license && (
                                <p className="agent-license">License: {agent.license}</p>
                            )}
                            {agent.experience && (
                                <p className="agent-experience">{agent.experience} years experience</p>
                            )}
                            {agent.specialties && agent.specialties.length > 0 && (
                                <div className="agent-specialties">
                                    {agent.specialties.map((specialty, index) => (
                                        <span key={index} className="specialty-tag">{specialty}</span>
                                    ))}
                                </div>
                            )}
                            <span className={`agent-status ${agent.status.toLowerCase()}`}>
                                {agent.status}
                            </span>
                        </div>
                        <div className="agent-actions">
                            <button 
                                className="edit-btn"
                                onClick={() => handleEdit(agent)}
                            >
                                Edit
                            </button>
                            <button 
                                className="delete-btn"
                                onClick={() => handleDelete(agent.id, `${agent.firstName} ${agent.lastName}`)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="no-agents">
                        <p>No agents found. Add your first agent to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentsPage;
