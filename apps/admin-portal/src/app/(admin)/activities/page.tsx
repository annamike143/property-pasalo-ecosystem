// --- apps/admin-portal/src/app/(admin)/activities/page.tsx ---
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { database } from '@/firebase';
import './activities.css';

export interface Activity {
  id: string;
  type: 'STATUS_CHANGE' | 'CLIENT_CREATED' | 'NOTE_ADDED' | 'CONTACT_UPDATE';
  clientId: string;
  clientName: string;
  timestamp: string;
  description: string;
  previousStatus?: string;
  newStatus?: string;
  additionalData?: any;
}

const ActivitiesPage = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('ALL');

    useEffect(() => {
        const activitiesRef = ref(database, 'activities');
        const activitiesQuery = query(activitiesRef, orderByChild('timestamp'));
        
        const unsubscribe = onValue(activitiesQuery, (snapshot) => {
            const data = snapshot.val();
            const loadedActivities: Activity[] = data 
                ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() // Most recent first
                : [];
            setActivities(loadedActivities);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredActivities = useMemo(() => {
        return filterType === 'ALL' 
            ? activities 
            : activities.filter(activity => activity.type === filterType);
    }, [activities, filterType]);

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'STATUS_CHANGE': return '🔄';
            case 'CLIENT_CREATED': return '➕';
            case 'NOTE_ADDED': return '📝';
            case 'CONTACT_UPDATE': return '📞';
            default: return '📋';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'STATUS_CHANGE': return 'status-change';
            case 'CLIENT_CREATED': return 'client-created';
            case 'NOTE_ADDED': return 'note-added';
            case 'CONTACT_UPDATE': return 'contact-update';
            default: return 'default';
        }
    };

    if (loading) return <p>Loading activities...</p>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Activity Log</h1>
                <p className="page-subtitle">Track all system activities and client interactions</p>
            </div>
            
            <div className="controls-container">
                <div className="filter-group">
                    <label htmlFor="filterType">Filter by Type:</label>
                    <select
                        id="filterType"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="ALL">All Activities</option>
                        <option value="STATUS_CHANGE">Status Changes</option>
                        <option value="CLIENT_CREATED">New Clients</option>
                        <option value="NOTE_ADDED">Notes Added</option>
                        <option value="CONTACT_UPDATE">Contact Updates</option>
                    </select>
                </div>
                <div className="stats-container">
                    <div className="stat-item">
                        <span className="stat-number">{activities.length}</span>
                        <span className="stat-label">Total Activities</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {activities.filter(a => a.type === 'STATUS_CHANGE').length}
                        </span>
                        <span className="stat-label">Status Changes</span>
                    </div>
                </div>
            </div>

            <div className="activities-container">
                {filteredActivities.length > 0 ? (
                    <div className="activities-list">
                        {filteredActivities.map(activity => (
                            <div key={activity.id} className={`activity-item ${getActivityColor(activity.type)}`}>
                                <div className="activity-header">
                                    <div className="activity-icon">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="activity-main">
                                        <div className="activity-title">
                                            <strong>{activity.clientName}</strong>
                                            <span className="activity-type">{activity.type.replace('_', ' ')}</span>
                                        </div>
                                        <div className="activity-description">
                                            {activity.description}
                                        </div>
                                        {activity.type === 'STATUS_CHANGE' && (
                                            <div className="status-change-details">
                                                <span className="status-badge previous">
                                                    {activity.previousStatus?.replace('_', ' ')}
                                                </span>
                                                <span className="arrow">→</span>
                                                <span className="status-badge new">
                                                    {activity.newStatus?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="activity-timestamp">
                                        {formatTimestamp(activity.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-activities">
                        <p>No activities found for the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivitiesPage;
