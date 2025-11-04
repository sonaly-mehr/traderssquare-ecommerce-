"use client";

import {  useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function VerifyEmailClient() {
  const [status, setStatus] = useState("verifying");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus("invalid");
    }
  }, [token]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        toast.success("Email verified successfully!");
      } else {
        setStatus("error");
        toast.error(data.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      toast.error("An error occurred during verification");
    }
  };

  return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-auto flex justify-center">
              <div className="text-2xl font-bold text-indigo-600">
                TradersSquare
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email Verification
            </h2>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            {status === "verifying" && (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === "success" && (
              <div>
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Email Verified Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your email has been verified. You can now sign in to your
                  account.
                </p>
                <Link
                  href="/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign In
                </Link>
              </div>
            )}

            {status === "error" && (
              <div>
                <div className="text-red-500 text-5xl mb-4">✗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verification Failed
                </h3>
                <p className="text-gray-600 mb-4">
                  The verification link is invalid or has expired.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Up Again
                </Link>
              </div>
            )}

            {status === "invalid" && (
              <div>
                <div className="text-yellow-500 text-5xl mb-4">⚠</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Invalid Verification Link
                </h3>
                <p className="text-gray-600 mb-4">
                  Please check your email for the correct verification link.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go Home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
