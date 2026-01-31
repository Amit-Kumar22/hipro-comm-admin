// Admin API Configuration – FINAL

const isBrowser = typeof window !== 'undefined';

const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  api: {
    baseURL:
      process.env.NEXT_PUBLIC_API_URL ||
      (isBrowser && window.location.hostname === 'localhost'
        ? 'http://localhost:3203'
        : 'https://shop.hiprotech.org'),

    // 🔥 IMPORTANT: ALWAYS /api/v1
    auth: '/api/v1/auth',
    products: '/api/v1/products',
    categories: '/api/v1/categories',
    orders: '/api/v1/orders',
    users: '/api/v1/users',
    admin: '/api/v1/admin',
    inventory: '/api/v1/inventory',
    customers: '/api/v1/customers',
    profile: '/api/v1/profile',
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
