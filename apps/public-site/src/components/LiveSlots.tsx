// --- apps/public-site/src/components/LiveSlots.tsx ---
'use client';
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import './LiveSlots.css';

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => { setHasMounted(true); }, []);
    if (!hasMounted) return <span>0</span>; // Render a non-animated 0 on the server
    return children;
};
const AnimatedCounter = ({ value }: { value: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));
    useEffect(() => {
        const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
        return controls.stop;
    }, [value, count]);
    return <motion.span>{rounded}</motion.span>;
};

const LiveSlots = () => {
    const [promoUnits, setPromoUnits] = useState(0);
    useEffect(() => {
        // This logic will need to be updated to count tags later
        const statusRef = ref(database, 'liveStatus/totalPioneers'); // Placeholder
        const unsubscribe = onValue(statusRef, (snapshot) => {
            const totalPioneers = snapshot.val() || 0;
            setPromoUnits(100 - totalPioneers); // Placeholder logic
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="live-slots-container">
            <div className="live-slots-data">
                <ClientOnly>
                    <AnimatedCounter value={promoUnits} />
                </ClientOnly>
            </div>
            <p className="live-slots-label">PROMO UNITS AVAILABLE</p>
            <Link href="/status" target="_blank" className="live-slots-link">
                This is not fake scarcity. See the Live Status Hub.
            </Link>
        </div>
    );
};
export default LiveSlots;