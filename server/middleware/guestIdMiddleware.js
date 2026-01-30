import { v4 as uuidv4 } from 'uuid';
import { parse, serialize } from 'cookie';

const GUEST_ID_COOKIE = 'guestId';
const GUEST_ID_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',
  maxAge: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years in milliseconds
  path: '/',
};

/**
 * Middleware to extract or create a guestId
 * - Checks cookie for existing guestId
 * - If missing, generates new UUID and sets cookie
 * - Stores guestId in req.guestId for downstream use
 */
export const guestIdMiddleware = (req, res, next) => {
  try {
    // Parse existing cookies
    const cookies = parse(req.headers.cookie || '');
    let guestId = cookies[GUEST_ID_COOKIE];

    // If no guestId exists, generate new one
    if (!guestId) {
      guestId = uuidv4();
      console.log(`Generated new guestId: ${guestId}`);
    } else {
    }

    // Always refresh the cookie expiry (2 years from now)
    res.setHeader(
      'Set-Cookie',
      serialize(GUEST_ID_COOKIE, guestId, GUEST_ID_COOKIE_OPTIONS)
    );

    // Store in request object for use in routes/controllers
    req.guestId = guestId;

    // Also allow frontend to access via headers (for debugging/development)
    res.setHeader('X-Guest-ID', guestId);

    next();
  } catch (error) {
    console.error('GuestId middleware error:', error);
    res.status(500).json({ message: 'Server error processing guest ID' });
  }
};

/**
 * Get guestId from request (either cookie or header)
 * Used in controllers
 */
export const getGuestId = (req) => {
  return req.guestId;
};

/**
 * Validate guestId format (UUID v4)
 */
export const validateGuestId = (guestId) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(guestId);
};

/**
 * Extract guestId from query or body for API calls
 * Fallback to request guestId if not provided
 */
export const extractGuestId = (req) => {
  const providedGuestId = req.query.guestId || req.body?.guestId;

  // If provided, validate it matches
  if (providedGuestId) {
    if (providedGuestId !== req.guestId) {
      console.warn(
        `GuestId mismatch: provided ${providedGuestId}, cookie has ${req.guestId}`
      );
      // Security: use the cookie guestId (server of truth)
    }
  }

  return req.guestId;
};
