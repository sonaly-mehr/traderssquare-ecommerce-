'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({});


  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$19.99',
      period: 'per month',
      priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
      features: [
        'Free shipping on all orders',
        'Exclusive member discounts',
        'Early access to new products',
        'Priority customer support'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$199',
      period: 'per year',
      originalPrice: '$239.88',
      savings: 'Save 2 months',
      priceId: process.env.STRIPE_YEARLY_PRICE_ID,
      features: [
        'Everything in Monthly plan',
        '2 months free compared to monthly',
        'Special yearly member badge',
        'Free expedited shipping'
      ],
      popular: true
    }
  ];

  const handleSubscribe = async (priceId, planId) => { // Accept planId
    if (status === 'unauthenticated') {
      router.push('/signin');
      return;
    }

    // Set loading state only for the clicked button
    setLoadingStates(prev => ({ ...prev, [planId]: true }));

    try {
      const response = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription session');
      }

      const { url } = await response.json(); // Destructure the URL from the response

      // Simply redirect the user to the Checkout page
      window.location.href = url;

    } catch (error) {
      toast.error('Failed to start subscription: ' + error.message);
      console.error('Subscription error:', error);
    } finally {
      // Clear loading state for this specific button
      setLoadingStates(prev => ({ ...prev, [planId]: false }));
    }
  };


  // Show loading while checking authentication or Stripe is initializing
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start saving today with our Plus membership
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-x-8 lg:max-w-6xl lg:mx-auto">
          {plans.map((plan) => {
            const isLoading = loadingStates[plan.id]; // Get loading state for this specific button
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg ${plan.popular ? 'ring-2 ring-green-600' : 'ring-1 ring-gray-200'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 text-sm font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>

                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="ml-1 text-xl font-semibold text-gray-500">{plan.period}</span>
                  </div>

                  {plan.originalPrice && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">{plan.originalPrice}</span>
                      <span className="text-sm font-semibold text-green-600">{plan.savings}</span>
                    </div>
                  )}

                  <ul className="mt-6 space-y-4">
                    {plan.features?.map((feature, idx) => (
                      <li key={feature ?? idx} className="flex items-center">
                        <svg
                          className="h-6 w-6 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.priceId, plan.id)} // Pass plan.id
                    disabled={isLoading || !plan.priceId}
                    className={`mt-8 w-full py-3 px-6 border border-transparent rounded-md text-white font-medium ${plan.popular ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    {isLoading ? 'Processing...' : `Get ${plan.name} Plan`}
                  </button>

                  {!plan.priceId && <p className="mt-2 text-sm text-red-500">Price not configured</p>}
                </div>
              </div>
            );
          })}
        </div>


        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Cancel anytime. No questions asked.</p>
        </div>
      </div>
    </div>
  );
}