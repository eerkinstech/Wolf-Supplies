import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { syncCart } from '../redux/slices/cartSlice';

/**
 * Hook that automatically syncs cart to backend whenever items change
 * Should be called at the app level to ensure all cart changes are persisted
 */
export const useCartSync = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);
  const previousItemsRef = useRef(cartItems);
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    // Check if cart items have changed
    const itemsChanged = JSON.stringify(previousItemsRef.current) !== JSON.stringify(cartItems);
    
    if (itemsChanged) {
      // Clear any pending sync timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce the sync to avoid too many requests
      // Sync both when items are added AND when items are removed (even if empty)
      syncTimeoutRef.current = setTimeout(() => {
        console.log('Auto-syncing cart items:', cartItems.length);
        dispatch(syncCart(cartItems));
      }, 500); // Wait 500ms after last change before syncing

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
