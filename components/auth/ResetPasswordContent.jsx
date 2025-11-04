"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import toast from "react-hot-toast";

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

// Create a separate component that uses useSearchParams
export default function ResetPasswordContent() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
    });

    const passwordValue = watch("password");

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, color: "bg-gray-200", text: "" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        const strengthMap = {
            1: { strength: 20, color: "bg-red-500", text: "Very Weak" },
            2: { strength: 40, color: "bg-orange-500", text: "Weak" },
            3: { strength: 60, color: "bg-yellow-500", text: "Fair" },
            4: { strength: 80, color: "bg-blue-500", text: "Good" },
            5: { strength: 100, color: "bg-green-500", text: "Strong" },
        };

        return strengthMap[strength] || { strength: 0, color: "bg-gray-200", text: "" };
    };

    const passwordStrength = getPasswordStrength(passwordValue);

    const onSubmit = async (data) => {
        if (!token) {
            toast.error("Invalid reset token");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password: data.password,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setSuccess(true);
                toast.success("Password reset successfully!");
            } else {
                toast.error(result.message || "Something went wrong!");
            }
        } catch (error) {
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <div className="mx-auto h-12 w-auto flex justify-center">
                            <div className="text-2xl font-bold text-indigo-600">TradersSquare</div>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Invalid Reset Link
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            The reset link is invalid or has expired.
                        </p>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/forgot-password"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Request a new reset link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <div className="mx-auto h-12 w-auto flex justify-center">
                            <div className="text-2xl font-bold text-indigo-600">TradersSquare</div>
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Password Reset Successfully
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Your password has been reset successfully.
                        </p>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/signin"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign In Now
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-auto flex justify-center">
                        <div className="text-2xl font-bold text-indigo-600">TradersSquare</div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Your Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your new password below
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="Enter new password"
                                {...register("password")}
                            />

                            {/* Password Strength Indicator */}
                            {passwordValue && (
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Password strength</span>
                                        <span className="text-xs font-medium text-gray-700">
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                placeholder="Confirm new password"
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                "Reset Password"
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/signin"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
