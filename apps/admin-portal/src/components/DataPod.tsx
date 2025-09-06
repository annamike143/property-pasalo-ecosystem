// --- apps/admin-portal/src/components/DataPod.tsx ---
'use client';
import React from 'react';
import './DataPod.css';

interface DataPodProps {
  title: string;
  value: number | string;
  // We can add an icon prop later if desired
}

const DataPod: React.FC<DataPodProps> = ({ title, value }) => {
  return (
    <div className="data-pod">
      <span className="data-pod-value">{value}</span>
      <h3 className="data-pod-title">{title}</h3>
    </div>
  );
};

export default DataPod;