'use client';
import { useState } from 'react';

export default function ManageBillingButton() {
    const [loading, setLoading] = useState(false);

    const handleManageBilling = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/create-customer-portal', {
                method: 'POST'
            });

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Error accessing customer portal:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button onClick={handleManageBilling} disabled={loading}>
            {loading ? 'Loading...' : 'Manage Billing & Subscription'}
        </button>
    );
}