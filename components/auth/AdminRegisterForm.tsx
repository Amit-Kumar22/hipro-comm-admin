'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerAdmin, clearAdminCredentials, logoutAdmin } from '@/redux/slices/adminAuthSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export default function AdminRegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.adminAuth);

  // Check password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const timer = setTimeout(() => {
        router.push('/admin');
      }, 1000);
      return () => clearTimeout(timer);
    }
    // If authenticated as non-admin, redirect to customer register
    if (isAuthenticated && user?.role !== 'admin') {
      const timer = setTimeout(() => {
        router.push('/register');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordMatch) {
      return;
    }
    
    try {
      const result = await dispatch(registerAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'admin' // Force admin role
      })).unwrap();
      
      router.push('/admin');
    } catch (err) {
      console.error('Admin registration failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
            <div className="mx-auto h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Admin Already Registered
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              You are already registered as <strong className="text-white">{user?.name}</strong>
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/admin')}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Go to Admin Dashboard
              </button>
              <button
                onClick={async () => {
                  try {
                    await dispatch(logoutAdmin()).unwrap();
                  } catch (error) {
                    dispatch(clearAdminCredentials());
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-white/30 text-sm font-medium rounded-md text-gray-300 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                Logout & Register New Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
            <div className="mx-auto h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Non-Admin Account Detected
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              You are not logged in as an admin user. Use customer registration instead.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/register')}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Go to Customer Registration
              </button>
              <button
                onClick={async () => {
                  try {
                    await dispatch(logoutAdmin()).unwrap();
                  } catch (error) {
                    dispatch(clearAdminCredentials());
                  }
                }}
                className="w-full flex justify-center py-2 px-4 border border-white/30 text-sm font-medium rounded-md text-gray-300 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                Logout & Try Admin Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8">
          {/* Admin Logo/Icon */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-center text-3xl font-extrabold text-white">
              Create Admin Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-300">
              Register a new administrator account
            </p>
            <div className="mt-2 text-center text-xs space-x-2">
              <Link 
                href="/admin/login" 
                className="text-purple-300 hover:text-purple-200 underline transition-colors"
              >
                Already have admin account?
              </Link>
              <span className="text-gray-400">|</span>
              <Link 
                href="/register" 
                className="text-orange-300 hover:text-orange-200 underline transition-colors"
              >
                Customer registration
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-md text-sm">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Admin Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter admin email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="Create secure password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 bg-white/10 border text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
                    !passwordMatch && formData.confirmPassword 
                      ? 'border-red-500/50 focus:ring-red-500' 
                      : 'border-white/20 focus:ring-purple-500'
                  }`}
                  placeholder="Confirm password"
                />
                {!passwordMatch && formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-300">Passwords do not match</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !passwordMatch || !formData.confirmPassword}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Admin Account...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Admin Account
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                By creating an admin account, you agree to the Terms of Service
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}