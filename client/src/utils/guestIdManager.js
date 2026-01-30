/**
 * Guest ID Manager - Handles persistent guest identity
 * Stores guestId from server cookie in localStorage as backup
 */

const GUEST_ID_KEY = 'guestId';

/**
 * Get the guestId from localStorage
 * (The actual persistent ID comes from the httpOnly cookie set by the server)
 */
export const getGuestId = () => {
  const guestId = localStorage.getItem(GUEST_ID_KEY);
  return guestId;
};

/**
 * Save the guestId to localStorage
 * Called after server responds with X-Guest-ID header
 */
export const saveGuestId = (guestId) => {
  if (!guestId) return;
  localStorage.setItem(GUEST_ID_KEY, guestId);
  console.log('Saved guestId to localStorage:', guestId);
};

/**
 * Clear the guestId from localStorage
 * (Note: httpOnly cookie will still exist on server until expiry or cleared)
 */
export const clearGuestId = () => {
  localStorage.removeItem(GUEST_ID_KEY);
  console.log('Cleared guestId from localStorage');
};

/**
 * Restore guestId - called on app init
 * Checks localStorage and ensures it's in sync with server cookie
 */
export const restoreGuestId = () => {
  const guestId = getGuestId();
  if (guestId) {
    console.log('Restored guestId from localStorage:', guestId);
  }
  return guestId;
};

/**
 * (Deprecated) Get or create - now handled by server middleware
 */
export const getOrCreateGuestId = () => {
  return getGuestId();
};
