'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // Auto-dismiss after this many ms
}

let notificationId = 1;

// Global notification state
let notifications: Notification[] = [];
let listeners: ((notifications: Notification[]) => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener(notifications));
}

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
  const newNotification: Notification = {
    ...notification,
    id: (notificationId++).toString(),
    timestamp: Date.now(),
    duration: notification.duration || 5000,
  };
  
  notifications = [newNotification, ...notifications.slice(0, 4)]; // Keep only 5 most recent
  notifyListeners();
  
  // Auto-dismiss
  if (newNotification.duration) {
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, newNotification.duration);
  }
  
  return newNotification.id;
}

export function removeNotification(id: string) {
  notifications = notifications.filter(n => n.id !== id);
  notifyListeners();
}

export function clearAllNotifications() {
  notifications = [];
  notifyListeners();
}

// Stock-specific notification helpers
export const stockNotifications = {
  stockUpdated: (productName: string, oldQuantity: number, newQuantity: number) => {
    const change = newQuantity - oldQuantity;
    const type = change > 0 ? 'success' : 'warning';
    
    return addNotification({
      type,
      title: 'Stock Updated',
      message: `${productName}: ${oldQuantity} → ${newQuantity} (${change > 0 ? '+' : ''}${change})`,
    });
  },
  
  orderProcessed: (orderId: string, itemsCount: number, totalStockReduction: number) => {
    return addNotification({
      type: 'info',
      title: 'Order Processed',
      message: `Order #${orderId}: ${itemsCount} items, ${totalStockReduction} total stock reduced`,
    });
  },
  
  lowStock: (productName: string, currentStock: number, reorderLevel: number) => {
    return addNotification({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${productName}: ${currentStock} units remaining (below ${reorderLevel})`,
      duration: 10000, // Keep longer for important alerts
    });
  },
  
  outOfStock: (productName: string) => {
    return addNotification({
      type: 'error',
      title: 'Out of Stock',
      message: `${productName} is now out of stock`,
      duration: 10000,
    });
  },
  
  syncCompleted: (itemsUpdated: number) => {
    return addNotification({
      type: 'success',
      title: 'Inventory Synced',
      message: `${itemsUpdated} inventory items synchronized`,
      duration: 3000,
    });
  },
};

export default function NotificationSystem() {
  const [currentNotifications, setCurrentNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const handleUpdate = (updatedNotifications: Notification[]) => {
      setCurrentNotifications(updatedNotifications);
    };
    
    listeners.push(handleUpdate);
    setCurrentNotifications(notifications); // Initial state
    
    return () => {
      listeners = listeners.filter(l => l !== handleUpdate);
    };
  }, []);

  if (currentNotifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {currentNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-3 rounded-lg border shadow-lg backdrop-blur-sm
            transform transition-all duration-300 ease-in-out
            hover:scale-105 cursor-pointer
            ${getColors(notification.type)}
          `}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="flex items-start space-x-2">
            <span className="text-lg flex-shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-xs opacity-90 break-words">
                {notification.message}
              </p>
              <p className="text-xs opacity-60 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="text-xs opacity-60 hover:opacity-100 flex-shrink-0 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}