/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as Toast from '@radix-ui/react-toast';
import { FiUser, FiLock, FiX, FiLogIn } from 'react-icons/fi';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const SignInPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [toasts, setToasts] = useState<{ id: string; title: string; description: string; type: 'success' | 'error' }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if user is already signed in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push('/admin');
            }
        });
        return () => unsubscribe();
    }, [router]);

    // Toast function
    const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, description, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Sign in with Firebase Authentication
            await signInWithEmailAndPassword(auth, email, password);
            showToast('Success', 'Signed in successfully!');
            router.push('/admin');
        } catch (error: any) {
            console.error('Sign-in error:', error);
            showToast('Error', `Failed to sign in: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center p-4">
            <Toast.Provider swipeDirection="right">
                {toasts.map((toast) => (
                    <Toast.Root
                        key={toast.id}
                        className={`bg-[#2A2A2A] border ${toast.type === 'success' ? 'border-[#4ade80]/30' : 'border-[#f87171]/30'} rounded-lg shadow-lg p-4 grid grid-cols-[auto_max-content] items-center gap-x-4`}
                    >
                        <div className="flex flex-col gap-1">
                            <Toast.Title className={`font-medium ${toast.type === 'success' ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                                {toast.title}
                            </Toast.Title>
                            <Toast.Description className="text-sm text-gray-300">
                                {toast.description}
                            </Toast.Description>
                        </div>
                        <Toast.Close className="text-gray-400 hover:text-white">
                            <FiX />
                        </Toast.Close>
                    </Toast.Root>
                ))}
                <Toast.Viewport className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-xs" />
            </Toast.Provider>

            <div className="bg-[#2A2A2A] rounded-xl p-8 w-full max-w-md shadow-lg">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/images/logo.png"
                        alt="BSS Logo"
                        width={60}
                        height={60}
                        className="w-15 h-15"
                        unoptimized
                    />
                </div>
                <h1 className="text-2xl font-bold text-[#FFD700] text-center mb-6">Admin Sign In</h1>
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
                            Email
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-300">
                            Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 p-3 bg-[#333333] border border-[#444444] text-white rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5]"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-[#FFD700] text-[#1A1A1A] py-3 rounded-lg font-medium hover:bg-[#E6C200] transition-colors flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <FiLogIn className="mr-2" />
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignInPage;