// --- apps/admin-portal/src/components/TabbedInfoBuilder.tsx ---
'use client';
import React, { useState } from 'react';
import './TabbedInfoBuilder.css';

// --- TypeScript Interfaces for our data structure ---
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
interface TabbedInfoBuilderProps {
  tabs: Tab[];
  setTabs: (newTabs: Tab[]) => void;
}

const TabbedInfoBuilder: React.FC<TabbedInfoBuilderProps> = ({ tabs, setTabs }) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || '');

  const handleAddTab = () => {
    const newTabId = `tab_${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: 'New Tab',
      data: [{ id: `kv_${Date.now()}`, key: 'New Key', value: 'New Value' }]
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const handleRemoveTab = (tabIdToRemove: string) => {
    if (tabs.length <= 1) {
        alert("You must have at least one tab.");
        return;
    }
    setTabs(tabs.filter(tab => tab.id !== tabIdToRemove));
    // If the active tab was deleted, set the first tab as active
    if (activeTabId === tabIdToRemove) {
        setActiveTabId(tabs[0]?.id || '');
    }
  };

  const handleTabTitleChange = (tabId: string, newTitle: string) => {
    setTabs(tabs.map(tab => tab.id === tabId ? { ...tab, title: newTitle } : tab));
  };

  const handleAddRow = (tabId: string) => {
    setTabs(tabs.map(tab => {
        if (tab.id === tabId) {
            return { ...tab, data: [...tab.data, { id: `kv_${Date.now()}`, key: '', value: '' }] };
        }
        return tab;
    }));
  };
  
  const handleRemoveRow = (tabId: string, rowId: string) => {
    setTabs(tabs.map(tab => {
        if (tab.id === tabId) {
            return { ...tab, data: tab.data.filter(row => row.id !== rowId) };
        }
        return tab;
    }));
  };

  const handleRowChange = (tabId: string, rowId: string, field: 'key' | 'value', newValue: string) => {
    setTabs(tabs.map(tab => {
        if (tab.id === tabId) {
            return {
                ...tab,
                data: tab.data.map(row => row.id === rowId ? { ...row, [field]: newValue } : row)
            };
        }
        return tab;
    }));
  };
  
  const activeTabData = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="tabbed-info-builder">
        <div className="tabs-nav">
            {tabs.map(tab => (
                <div key={tab.id} className={`tab-handle ${tab.id === activeTabId ? 'active' : ''}`}>
                    <span onClick={() => setActiveTabId(tab.id)}>{tab.title}</span>
                </div>
            ))}
            <button type="button" onClick={handleAddTab} className="add-tab-btn">+</button>
        </div>
        
        {activeTabData && (
            <div className="tab-content">
                <div className="tab-title-editor">
                    <input 
                        type="text" 
                        value={activeTabData.title}
                        onChange={(e) => handleTabTitleChange(activeTabData.id, e.target.value)}
                    />
                     <button type="button" onClick={() => handleRemoveTab(activeTabData.id)} className="remove-tab-btn">Delete Tab</button>
                </div>

                {activeTabData.data.map(row => (
                    <div key={row.id} className="kv-row">
                        <input type="text" value={row.key} onChange={(e) => handleRowChange(activeTabData.id, row.id, 'key', e.target.value)} placeholder="Key (e.g., Lot Area)" />
                        <input type="text" value={row.value} onChange={(e) => handleRowChange(activeTabData.id, row.id, 'value', e.target.value)} placeholder="Value (e.g., 80 sqm)" />
                        <button type="button" onClick={() => handleRemoveRow(activeTabData.id, row.id)} className="remove-row-btn">&times;</button>
                    </div>
                ))}
                <button type="button" onClick={() => handleAddRow(activeTabData.id)} className="add-row-btn">+ Add New Row</button>
            </div>
        )}
    </div>
  );
};

export default TabbedInfoBuilder;