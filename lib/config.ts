// Admin API Configuration - Automatically detects environment
const config = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API URLs - automatically selected based on environment
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 
             (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
              ? 'http://localhost:5000' 
              : 'https://api.shop.hiprotech.org'),
    
    // Common endpoints
    auth: '/api/auth',
    products: '/api/products',
    categories: '/api/categories',
    orders: '/api/orders',
    users: '/api/users',
    admin: '/api/admin',
    inventory: '/api/inventory',
  },
  
  // App URLs
  app: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ||
             (typeof window !== 'undefined' && window.location.hostname === 'localhost'
              ? 'http://localhost:3202'
              : 'https://admin.shop.hiprotech.org'),
              
    frontendURL: typeof window !== 'undefined' && window.location.hostname === 'localhost'
                 ? 'http://localhost:3201'
                 : 'https://shop.hiprotech.org',
  },
  
  // Upload configuration
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  }
};

export default config;