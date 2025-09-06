// --- apps/public-site/src/components/TabbedInfo.tsx ---
'use client';
import React, { useState } from 'react';

interface KeyValuePair {
    id: string;
    key: string;
    value: string;
}

interface Tab {
    id: string;
    title: string;
    data: KeyValuePair[];
}

interface TabbedInfoProps {
    tabs: Tab[];
}

const TabbedInfo: React.FC<TabbedInfoProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!tabs || tabs.length === 0) {
        return <div>No additional information available.</div>;
    }

    return (
        <div className="tabbed-info-container">
            <h3>Property Details</h3>
            <div className="tab-headers">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        className={`tab-header ${index === activeTab ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs[activeTab] && (
                    <div className="key-value-pairs">
                        {tabs[activeTab].data.map((pair) => (
                            <div key={pair.id} className="kv-pair">
                                <span className="key">{pair.key}:</span>
                                <span className="value">{pair.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .tabbed-info-container {
                    margin: 2rem 0;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .tabbed-info-container h3 {
                    margin: 0;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #e5e7eb;
                    color: #374151;
                }
                
                .tab-headers {
                    display: flex;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .tab-header {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: none;
                    background-color: transparent;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s;
                }
                
                .tab-header:hover {
                    background-color: #e5e7eb;
                }
                
                .tab-header.active {
                    background-color: white;
                    border-bottom-color: #0B6E4F;
                    font-weight: 600;
                    color: #0B6E4F;
                }
                
                .tab-content {
                    padding: 1.5rem;
                }
                
                .kv-pair {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f3f4f6;
                }
                
                .kv-pair:last-child {
                    border-bottom: none;
                }
                
                .key {
                    font-weight: 600;
                    color: #374151;
                    flex: 1;
                }
                
                .value {
                    color: #6b7280;
                    flex: 1;
                    text-align: right;
                }
            `}</style>
        </div>
    );
};

export default TabbedInfo;