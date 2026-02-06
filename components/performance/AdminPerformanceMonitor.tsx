'use client';

import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export default function AdminPerformanceMonitor() {
  useEffect(() => {
    // Monitor in both development and production for admin panel
    console.log('🔧 Admin Performance monitoring enabled');
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Monitor Web Vitals
    monitorWebVitals();

    // Monitor API performance (admin-specific)
    monitorAdminAPIPerformance();

    // Monitor memory usage
    monitorMemoryUsage();

    // Log development metrics
    logDevelopmentMetrics();

  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Admin Service Worker registered:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              console.log('🔄 Admin: New content available, refreshing...');
              // Auto-refresh when new version is available
              window.location.reload();
            }
          });
        }
      });
    } catch (error) {
      console.error('❌ Admin Service Worker registration failed:', error);
    }
  };

  const monitorWebVitals = () => {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log(`🔧 Admin FCP: ${Math.round(entry.startTime)}ms`);
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        console.log(`🔧 Admin LCP: ${Math.round(entry.startTime)}ms`);
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        console.log(`🔧 Admin FID: ${Math.round(entry.processingStart - entry.startTime)}ms`);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsScore = 0;
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      if (clsScore > 0) {
        console.log(`🔧 Admin CLS: ${clsScore.toFixed(4)}`);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  };

  const monitorAdminAPIPerformance = () => {
    // Intercept fetch requests to monitor admin API performance
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        // Log admin API performance
        if (typeof url === 'string' && url.includes('/api/admin/')) {
          if (duration > 2000) {
            console.warn(`🔧 🐌 Slow Admin API: ${url} took ${duration}ms`);
          } else if (duration > 1000) {
            console.log(`🔧 ⏳ Admin API: ${url} took ${duration}ms`);
          } else {
            console.log(`🔧 ⚡ Admin API: ${url} took ${duration}ms`);
          }
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        console.error(`🔧 ❌ Admin API failed: ${url} after ${duration}ms`, error);
        throw error;
      }
    };
  };

  const monitorMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryInfo = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
      
      console.log('🔧 🧠 Admin Memory Usage:', memoryInfo);
      
      // Check for memory leaks (admin panels often have more data)
      setInterval(() => {
        const currentMemory = (performance as any).memory;
        const currentUsed = Math.round(currentMemory.usedJSHeapSize / 1024 / 1024);
        
        if (currentUsed > memoryInfo.used * 2) {
          console.warn('🔧 ⚠️ Admin: Potential memory leak detected:', {
            initial: memoryInfo.used,
            current: currentUsed
          });
        }
      }, 30000); // Check every 30 seconds
    }
  };

  const logDevelopmentMetrics = () => {
    // Log development metrics
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        console.log('🔧 🚀 Admin Performance Metrics:', {
          'DNS Lookup': `${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`,
          'TCP Connection': `${Math.round(navigation.connectEnd - navigation.connectStart)}ms`,
          'Server Response': `${Math.round(navigation.responseStart - navigation.requestStart)}ms`,
          'DOM Content Loaded': `${Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)}ms`,
          'Page Load Complete': `${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`
        });
      }
    }, 1000);
  };

  // Component doesn't render anything
  return null;
}

// Hook for using admin performance metrics
export function useAdminPerformanceMetrics() {
  const getMetrics = (): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      fcp: 0, // Will be populated by observer
      lcp: 0, // Will be populated by observer
      fid: 0, // Will be populated by observer
      cls: 0, // Will be populated by observer
      ttfb: navigation ? Math.round(navigation.responseStart - navigation.requestStart) : 0
    };
  };

  const logCurrentMetrics = () => {
    const metrics = getMetrics();
    console.log('🔧 Admin Metrics:');
    console.table(metrics);
  };

  const clearAdminCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const adminCaches = cacheNames.filter(name => name.includes('admin'));
      
      await Promise.all(adminCaches.map(name => caches.delete(name)));
      console.log('🔧 🗑️ Cleared admin cache');
    }
  };

  return { getMetrics, logCurrentMetrics, clearAdminCache };
}