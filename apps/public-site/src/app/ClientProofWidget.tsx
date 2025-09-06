// --- apps/public-site/src/app/ClientProofWidget.tsx ---
'use client';
import React from 'react';
import { ProofWidget } from '@repo/ui/proof-widget';
import { database } from '../firebase';

export const ClientProofWidget: React.FC = () => {
  return <ProofWidget firebaseDatabase={database} />;
};
