// --- apps/public-site/src/components/PageClientWrapper.tsx (FINAL) ---
'use client';
import React, { useState, Children, cloneElement, isValidElement } from 'react';
import Header from './Header'; 
import SignupModal from './SignupModal'; // Import the modal

// This component now handles all client-side state and injects props
export const PageClientWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // This is a powerful React pattern to add props to our server-rendered children
    const childrenWithProps = Children.map(children, child => {
        if (isValidElement(child)) {
            // We are looking for components that need the onCtaClick function
            // and cloning them with the new prop.
            return cloneElement(child as React.ReactElement<{onCtaClick?: () => void}>, { onCtaClick: openModal });
        }
        return child;
    });

    return (
        <>
            <Header onCtaClick={openModal} />
            {childrenWithProps}
            <SignupModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};