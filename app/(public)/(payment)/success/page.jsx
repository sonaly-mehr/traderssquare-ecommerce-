// app/success/page.jsx
'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    setSessionId(id);
  }, []);

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your subscription. Your Plus membership is now active, and you can start enjoying exclusive benefits.
        </p>
        <div className="space-y-3">
          <Link
            href="/shop"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors block"
          >
            Start Shopping
          </Link>
          <Link
            href="/profile"
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-md transition-colors block"
          >
            Go to Your Profile
          </Link>
        </div>
        {/* {sessionId && (
          <p className="text-xs text-gray-500 mt-6">Order Reference: {sessionId}</p>
        )} */}
      </div>
    </div>
  );
}