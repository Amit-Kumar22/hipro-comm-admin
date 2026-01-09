'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logoutAdmin, clearAdminCredentials } from '@/redux/slices/adminAuthSlice';
import InventorySyncService from '@/components/services/InventorySyncService';
import InventoryStatusIndicator from '@/components/ui/InventoryStatusIndicator';
import NotificationSystem from '@/components/services/NotificationSystem';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.adminAuth);
  const [isChecking, setIsChecking] = useState(true);

  // Skip authentication checks for login and register pages
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    // Give time for auth state to initialize from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Skip auth checks for auth pages
    if (isAuthPage) return;
    
    if (!isChecking) {
      if (!isAuthenticated) {
        console.log('Admin layout: User not authenticated, redirecting to login');
        router.push('/login');
      } else if (user && user.role !== 'admin') {
        console.log('Admin layout: User not admin, redirecting to customer site', user);
        window.location.href = 'http://localhost:3000';
      }
    }
  }, [isAuthenticated, user, router, isChecking, isAuthPage]);

  // Show loading while checking authentication
  if (!isAuthPage && (isChecking || loading || !isAuthenticated || !user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p className="text-gray-600">
            {loading ? 'Loading...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
    } catch (error) {
      // Even if server request fails, clear local state
      dispatch(clearAdminCredentials());
    }
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Users', href: '/users', icon: '👥' },
    { name: 'Products', href: '/products', icon: '📦' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Stock', href: '/stock', icon: '📋' },
    { name: 'Orders', href: '/orders', icon: '🛒' },
    { name: 'System', href: '/system', icon: '⚙️' },
  ];

  // Render login/register pages without admin navigation
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Colorful Enhanced Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg border-b-2 border-orange-300">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold text-white drop-shadow-lg hover:text-yellow-300 transition-colors">
                🚀 Hiprotech Admin
              </Link>
              <span className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                ✨ {user?.name}
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-white hover:text-yellow-300 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 backdrop-blur-sm font-medium"
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <a 
                href="http://localhost:3000" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                🌐 View Site
              </a>
              <button 
                onClick={handleLogout}
                className="text-sm bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Colorful Mobile Navigation */}
      <div className="md:hidden bg-gradient-to-r from-purple-500 to-pink-500 border-b-2 border-purple-300">
        <div className="px-6 py-4">
          <div className="flex space-x-6 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex-shrink-0 text-sm text-white hover:text-yellow-300 transition-all duration-300 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 backdrop-blur-sm font-medium"
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 lg:p-6">
        <InventorySyncService>
          {children}
        </InventorySyncService>
      </main>
      
      {/* Inventory Status Indicator */}
      <InventoryStatusIndicator />
      
      {/* Notification System */}
      <NotificationSystem />
    </div>
  );
}
