import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { syncCart } from '../redux/slices/cartSlice';

/**
 * Hook that automatically syncs cart to backend whenever items change
 * Should be called at the app level to ensure all cart changes are persisted
 * 
 * This syncs IMMEDIATELY to ensure items persist even if user navigates away
 * or reloads, matching the same behavior as wishlist persistence
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);
  const previousItemsRef = useRef(cartItems);
  const syncTimeoutRef = useRef(null);
  const lastSyncTimeRef = useRef(0);

  useEffect(() => {
    // Check if cart items have changed
    const itemsChanged = JSON.stringify(previousItemsRef.current) !== JSON.stringify(cartItems);
    
    if (itemsChanged) {
      // Clear any pending sync timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Use minimal debounce (50ms) to batch rapid changes while syncing almost immediately
      // This ensures cart items are persisted to server before user navigates away or reloads
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;
      const delayNeeded = Math.max(0, 50 - timeSinceLastSync);

      syncTimeoutRef.current = setTimeout(() => {
        lastSyncTimeRef.current = Date.now();
        dispatch(syncCart(cartItems));
      }, delayNeeded);

      previousItemsRef.current = cartItems;
    }

    // Cleanup on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cartItems, dispatch]);
};
