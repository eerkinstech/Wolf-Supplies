import { saveGuestId } from './guestIdManager';

/**
 * Enhanced fetch wrapper that:
 * 1. Ensures credentials (httpOnly cookies) are sent with every request
 * 2. Captures X-Guest-ID from server responses and saves to localStorage
 */
export const createEnhancedFetch = () => {
  const originalFetch = window.fetch.bind(window);

  return function fetch(url, options = {}) {
    // Ensure credentials are always included (for httpOnly cookie)
    const enhancedOptions = {
      ...options,
      credentials: 'include', // CRITICAL: sends httpOnly cookies with every request
    };

    return originalFetch(url, enhancedOptions).then(response => {
      // Capture X-Guest-ID header from response
      const guestId = response.headers.get('X-Guest-ID');
      if (guestId) {saveGuestId(guestId);
      }
      return response;
    }).catch(err => {throw err;
    });
  };
};

/**
 * Install the enhanced fetch globally
 */
export const installEnhancedFetch = () => {
  window.fetch = createEnhancedFetch();};
