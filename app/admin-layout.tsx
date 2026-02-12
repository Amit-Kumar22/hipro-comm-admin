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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: 'Delete History', href: '/products/delete-history', icon: '🗑️' },
    { name: 'Categories', href: '/categories', icon: '📂' },
    { name: 'Stock', href: '/stock', icon: '📋' },
    { name: 'Orders', href: '/orders', icon: '🛒' },
    { name: 'Payment History', href: '/payment-history', icon: '💳' },
    { name: 'System', href: '/system', icon: '⚙️' },
  ];

  // Render login/register pages without admin navigation
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 text-gray-900 hover:text-gray-700 transition-colors">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="font-semibold text-base">Admin</span>
              </Link>
              <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
              <span className="hidden sm:inline text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                {user?.name}
              </span>
            </div>

            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              <a 
                href="http://localhost:3000" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-gray-800 hover:bg-gray-900 text-white px-2.5 py-1.5 rounded transition-colors font-medium"
                title="View Live Site"
              >
                <span className="hidden sm:inline">🔗 Site</span>
                <span className="sm:hidden">🔗</span>
              </a>
              <button 
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded transition-colors font-medium"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Bar - Tablet */}
        <div className="hidden md:block lg:hidden border-t border-gray-100">
          <div className="px-4 py-2">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex-shrink-0 flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* User info in mobile menu */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="px-3 py-2 text-xs text-gray-500">
                  Logged in as: <span className="font-medium text-gray-700">{user?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        <InventorySyncService>
          {children}
        </InventorySyncService>
      </main>
      
      {/* Inventory Status Indicator - Removed as per request */}
      {/* <InventoryStatusIndicator /> */}
      
      {/* Notification System */}
      <NotificationSystem />
    </div>
  );
}
