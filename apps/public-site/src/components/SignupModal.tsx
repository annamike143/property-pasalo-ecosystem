// --- apps/public-site/src/components/SignupModal.tsx ---
'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SignupModal.css';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) { document.body.style.overflow = 'hidden'; } 
        else { document.body.style.overflow = 'unset'; }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Placeholder for Brevo/Seller form HTML
    const formHtml = `<div>FORM GOES HERE</div>`;
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="modal-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                        <button className="close-button" onClick={onClose}>&times;</button>
                        <div dangerouslySetInnerHTML={{ __html: formHtml }} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
export default SignupModal;