'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { syncOrdersWithInventory } from '@/redux/slices/orderInventorySlice';
import { autoSyncStockFromOrders, getInventory, getInventoryStats } from '@/redux/slices/inventorySlice';
import { stockNotifications } from './NotificationSystem';

interface InventorySyncServiceProps {
  children: React.ReactNode;
}

export default function InventorySyncService({ children }: InventorySyncServiceProps) {
  const dispatch = useAppDispatch();
  const { stockAffectingOrders, lastSyncTime } = useAppSelector((state) => state.orderInventory);

  // Auto-sync every 5 minutes
  useEffect(() => {
    const syncInterval = setInterval(() => {
      handleOrderInventorySync();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial sync
    handleOrderInventorySync();

    return () => clearInterval(syncInterval);
  }, [dispatch]);

  // Process stock-affecting orders
  useEffect(() => {
    if (stockAffectingOrders.length > 0) {
      handleStockUpdatesFromOrders();
    }
  }, [stockAffectingOrders]);

  const handleOrderInventorySync = async () => {
    try {
      await dispatch(syncOrdersWithInventory()).unwrap();
    } catch (error: any) {
      console.warn('Order inventory sync failed:', error);
      // Don't show error toast for background sync failures
    }
  };

  const handleStockUpdatesFromOrders = async () => {
    try {
      const orderUpdates: any[] = [];
      
      for (const order of stockAffectingOrders) {
        for (const item of order.items) {
          let adjustment = 0;
          let reason = '';
          
          switch (order.status) {
            case 'confirmed':
            case 'processing':
              adjustment = -item.quantity;
              reason = `Order ${order.orderNumber} confirmed - Stock reserved`;
              break;
            case 'cancelled':
              adjustment = item.quantity;
              reason = `Order ${order.orderNumber} cancelled - Stock returned`;
              break;
            default:
              continue;
          }
          
          if (adjustment !== 0) {
            orderUpdates.push({
              productId: item.product._id,
              sku: item.product.sku,
              productName: item.product.name,
              adjustment,
              reason,
              orderId: order._id,
              orderNumber: order.orderNumber
            });
          }
        }
      }
      
      if (orderUpdates.length > 0) {
        const results = await dispatch(autoSyncStockFromOrders(orderUpdates)).unwrap();
        
        const successCount = results.filter((r: any) => r.success).length;
        const failureCount = results.filter((r: any) => !r.success).length;
        
        if (successCount > 0) {
          stockNotifications.syncCompleted(successCount);
          
          // Show individual stock updates
          results.forEach((result: any) => {
            if (result.success && result.oldQuantity !== undefined && result.newQuantity !== undefined) {
              stockNotifications.stockUpdated(
                result.productName || result.sku, 
                result.oldQuantity, 
                result.newQuantity
              );
              
              // Check for low stock alerts
              if (result.newQuantity <= (result.reorderLevel || 10) && result.newQuantity > 0) {
                stockNotifications.lowStock(
                  result.productName || result.sku, 
                  result.newQuantity, 
                  result.reorderLevel || 10
                );
              } else if (result.newQuantity <= 0) {
                stockNotifications.outOfStock(result.productName || result.sku);
              }
            }
          });
          
          // Refresh inventory data
          dispatch(getInventory({}));
          dispatch(getInventoryStats());
        }
        
        if (failureCount > 0) {
          console.error(`Failed to update stock for ${failureCount} product${failureCount > 1 ? 's' : ''}`);
        }
      }
    } catch (error: any) {
      console.error('Stock update from orders failed:', error);
    }
  };

  return <>{children}</>;
}