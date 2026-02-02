// Admin API Configuration – FINAL

const isBrowser = typeof window !== 'undefined';

const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  api: {
    baseURL:
      process.env.NEXT_PUBLIC_API_URL ||
      (isBrowser && window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/v1'
        : 'https://shop.hiprotech.org/api/v1'),

    // Endpoint paths (relative to baseURL)
    auth: '/auth',
    products: '/products',
    categories: '/categories',
    orders: '/orders',
    users: '/users',
    admin: '/admin',
    inventory: '/inventory',
    customers: '/customers',
    profile: '/profile',
    dashboard: '/dashboard',
    analytics: '/analytics',
    payments: '/payments',
    reports: '/reports',
  },

  // Upload configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  // API Request configuration
  request: {
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
  },

  app: {
    baseURL:
      process.env.NEXT_PUBLIC_APP_URL ||
      (isBrowser && window.location.hostname === 'localhost'
        ? 'http://localhost:3202'
        : 'https://adminshop.hiprotech.org'),

    frontendURL:
      isBrowser && window.location.hostname === 'localhost'
        ? 'http://localhost:3201'
        : 'https://shop.hiprotech.org',
  },
};

export default config;
