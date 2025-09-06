// --- apps/admin-portal/src/components/AgentProfile.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';
import Image from 'next/image';
import { Agent } from '../app/(admin)/agents/page';
import './AgentProfile.css';

interface AgentProfileProps {
    agentId?: string;
    showContactInfo?: boolean;
    variant?: 'card' | 'inline' | 'detailed';
}

const AgentProfile: React.FC<AgentProfileProps> = ({ 
    agentId, 
    showContactInfo = true, 
    variant = 'card' 
}) => {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agentId) {
            setLoading(false);
            return;
        }

        const agentRef = ref(database, `agents/${agentId}`);
        const unsubscribe = onValue(agentRef, (snapshot) => {
            if (snapshot.exists()) {
                setAgent({ id: agentId, ...snapshot.val() });
            } else {
                setAgent(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agentId]);

    if (loading) {
        return <div className="agent-profile-skeleton">Loading agent...</div>;
    }

    if (!agent) {
        return null;
    }

    const AgentPhoto = () => (
        <div className="agent-photo">
            {agent.profilePictureUrl ? (
                <Image 
                    src={agent.profilePictureUrl} 
                    alt={`${agent.firstName} ${agent.lastName}`}
                    width={variant === 'detailed' ? 150 : 80}
                    height={variant === 'detailed' ? 150 : 80}
                    className="agent-image"
                />
            ) : (
                <div className={`agent-placeholder ${variant}`}>
                    {agent.firstName[0]}{agent.lastName[0]}
                </div>
            )}
        </div>
    );

    const AgentInfo = () => (
        <div className="agent-info">
            <h3 className="agent-name">{agent.firstName} {agent.lastName}</h3>
            {agent.license && (
                <p className="agent-license">License: {agent.license}</p>
            )}
            {agent.experience && (
                <p className="agent-experience">{agent.experience} years experience</p>
            )}
            {agent.specialties && agent.specialties.length > 0 && (
                <div className="agent-specialties">
                    <strong>Specialties:</strong>
                    <div className="specialty-tags">
                        {agent.specialties.map((specialty, index) => (
                            <span key={index} className="specialty-tag">{specialty}</span>
                        ))}
                    </div>
                </div>
            )}
            {agent.bio && variant === 'detailed' && (
                <div className="agent-bio">
                    <strong>About:</strong>
                    <p>{agent.bio}</p>
                </div>
            )}
            {showContactInfo && (
                <div className="agent-contact">
                    <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <a href={`mailto:${agent.email}`} className="contact-link">
                            {agent.email}
                        </a>
                    </div>
                    <div className="contact-item">
                        <span className="contact-icon">📱</span>
                        <a href={`tel:${agent.phone}`} className="contact-link">
                            {agent.phone}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );

    // Card variant (default)
    if (variant === 'card') {
        return (
            <div className="agent-profile-card">
                <div className="agent-profile-header">
                    <span className="agent-profile-label">Your Agent</span>
                </div>
                <div className="agent-profile-content">
                    <AgentPhoto />
                    <AgentInfo />
                </div>
            </div>
        );
    }

    // Inline variant
    if (variant === 'inline') {
        return (
            <div className="agent-profile-inline">
                <AgentPhoto />
                <AgentInfo />
            </div>
        );
    }

    // Detailed variant
    if (variant === 'detailed') {
        return (
            <div className="agent-profile-detailed">
                <div className="agent-profile-header">
                    <h2>Meet Your Agent</h2>
                </div>
                <div className="agent-profile-content">
                    <AgentPhoto />
                    <AgentInfo />
                </div>
            </div>
        );
    }

    return null;
};

export default AgentProfile;
