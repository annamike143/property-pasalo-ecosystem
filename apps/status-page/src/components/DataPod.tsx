// --- apps/status-page/src/components/DataPod.tsx ---
'use client';
import React from 'react';
import './DataPod.css';
// We can add the animated counter here later if we choose

interface DataPodProps {
  title: string;
  value: number | string;
  icon?: React.ReactElement;
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
