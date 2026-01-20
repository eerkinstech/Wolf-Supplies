import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';
import getStripe from '../utils/stripeClient';
import { useRef } from 'react';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalQuantity } = useSelector((state) => state.cart);

  const shippingCost = totalPrice > 50 ? 0 : 5.99;
  const finalTotal = totalPrice + shippingCost;

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getImgSrc = (img) => {
    if (!img) return 'https://via.placeholder.com/150';
    if (Array.isArray(img)) {
      const first = img.find((x) => !!x);
      return getImgSrc(first);
    }
    if (typeof img === 'object') {
      const url = img.url || img.secure_url || img.path || img.src || img.public_id || img.location;
      if (!url) return 'https://via.placeholder.com/150';
      return typeof url === 'string' ? (url.startsWith('http') ? url : `${API}${url}`) : 'https://via.placeholder.com/150';
    }
    if (typeof img === 'string') return img.startsWith('http') ? img : `${API}${img}`;
    return 'https://via.placeholder.com/150';
  };

  const renderVariantSummary = (item) => {
    if (!item) return null;
    const parts = [];
    if (item.selectedSize) parts.push(`Size: ${item.selectedSize}`);
    if (item.selectedColor) parts.push(`Color: ${item.selectedColor}`);
    if (item.selectedVariants && typeof item.selectedVariants === 'object') {
      Object.entries(item.selectedVariants).forEach(([k, v]) => {
        if (v) parts.push(`${k}: ${v}`);
      });
    }
    if (parts.length === 0) return null;
    return <div className="text-sm text-gray-900">{parts.join(' / ')}</div>;
  };

  const formatCardNumber = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  // Checkout form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Card details (we won't persist CVV)
  const [nameOnCard, setNameOnCard] = useState('');

  // Billing address toggle + fields
  const [billingOpen, setBillingOpen] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [billingApartment, setBillingApartment] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingStateRegion, setBillingStateRegion] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  const [saveDetails, setSaveDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const stripeRef = useRef(null);
  const elementsRef = useRef(null);
  const cardRef = useRef(null);
  const cardMountedRef = useRef(false);

  // Load saved details from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('checkoutSavedInfo') || 'null');
      if (saved) {
        setFirstName(saved.firstName || '');
        setLastName(saved.lastName || '');
        setEmail(saved.email || '');
        setPhone(saved.phone || '');
        setAddress(saved.address || '');
        setApartment(saved.apartment || '');
        setCity(saved.city || '');
        setStateRegion(saved.stateRegion || '');
        setPostalCode(saved.postalCode || '');
        setCountry(saved.country || '');
        setSaveDetails(true);
      }
    } catch (err) {
      console.error('load saved checkout error', err);
    }
  }, []);

  // Initialize Stripe Elements (client-side only)
  useEffect(() => {
    const setupStripe = async () => {
      try {
        const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        if (!pk) return console.warn('VITE_STRIPE_PUBLISHABLE_KEY not set; Stripe Elements disabled');
        // use singleton getStripe to avoid creating multiple instances
        const stripe = await getStripe();
        stripeRef.current = stripe;
        // create elements from the existing stripe instance
        const elements = stripeRef.current.elements();
        elementsRef.current = elements;
        if (!cardMountedRef.current) {
          const card = elements.create('card', { hidePostalCode: true });
          card.mount('#card-element');
          cardRef.current = card;
          cardMountedRef.current = true;
          // display real-time validation errors
          card.on('change', (e) => {
            const display = document.getElementById('card-errors');
            if (display) display.textContent = e.error ? e.error.message : '';
          });
        }
      } catch (err) {
        console.error('Stripe init error', err);
      }
    };
    setupStripe();
    return () => {
      try {
        if (cardRef.current) cardRef.current.unmount();
      } catch (e) { }
    };
  }, []);

  // Ensure Stripe Elements are initialized (attempt re-init if necessary)
  const ensureStripeReady = async () => {
    if (stripeRef.current && cardRef.current) return true;
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pk) return false;
    try {
      // If stripe is already loaded but card not mounted, create elements from same stripe instance
      // use singleton getStripe to avoid creating multiple instances
      const stripe = await getStripe();
      stripeRef.current = stripe;
      if (!cardRef.current) {
        const elements = stripeRef.current.elements();
        elementsRef.current = elements;
        const card = elements.create('card', { hidePostalCode: true });
        card.mount('#card-element');
        cardRef.current = card;
        cardMountedRef.current = true;
        card.on('change', (e) => {
          const display = document.getElementById('card-errors');
          if (display) display.textContent = e.error ? e.error.message : '';
        });
      }
      return true;
    } catch (err) {
      console.error('Stripe re-init error', err);
      return false;
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode || !stateRegion) {
      toast.error('Please complete all required fields');
      return;
    }

    const shippingAddress = {
      firstName,
      lastName,
      email,
      phone,
      address,
      apartment,
      city,
      state: stateRegion,
      postalCode,
      country,
    };

    const orderData = {
      orderItems: items.map((i) => ({ product: i._id, qty: i.quantity, price: i.price, name: i.name, image: i.image })),
      shippingAddress,
      paymentMethod,
      // minimal paymentDetails: only store name on card when needed (we use Elements)
      paymentDetails: { nameOnCard },
      itemsPrice: totalPrice,
      taxPrice: 0,
      shippingPrice: Number(shippingCost.toFixed(2)),
      totalAmount: Number(finalTotal.toFixed(2)),
    };

    try {
      setLoading(true);

      // Save non-card details to localStorage if requested
      if (saveDetails) {
        const toSave = { firstName, lastName, email, phone, address, apartment, city, stateRegion, postalCode, country };
        localStorage.setItem('checkoutSavedInfo', JSON.stringify(toSave));
      } else {
        localStorage.removeItem('checkoutSavedInfo');
      }

      // Build payload for server which will create an Order and a Stripe Checkout session
      const payload = {
        orderItems: items.map((i) => ({
          name: i.name,
          price: i.price,
          qty: i.quantity,
          product: i.product || i._id,
          image: i.image,
          // variant snapshot fields (if present)
          selectedVariants: i.selectedVariants || null,
          selectedSize: i.selectedSize || null,
          selectedColor: i.selectedColor || null,
          variantId: i.variantId || i.snapshot?.variantId || null,
        })),
        shippingAddress: {
          address,
          apartment,
          city,
          stateRegion,
          postalCode,
          country,
          firstName,
          lastName,
          email,
          phone,
        },
        billingAddress: billingOpen ? {
          address: billingAddress,
          apartment: billingApartment,
          city: billingCity,
          stateRegion: billingStateRegion,
          postalCode: billingPostalCode,
          country: billingCountry,
        } : null,
        paymentMethod,
        itemsPrice: totalPrice,
        taxPrice: 0,
        shippingPrice: Number(shippingCost.toFixed(2)),
        totalAmount: Number(finalTotal.toFixed(2)),
      };

      // Try to ensure Stripe Elements are ready; if not available, fall back to hosted Stripe Checkout
      const stripeReady = await ensureStripeReady();
      if (!stripeReady) {
        // fallback: create hosted Checkout session
        const token = localStorage.getItem('token');
        const resSession = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        const sessionData = await resSession.json();
        if (!resSession.ok) throw new Error(sessionData.error || sessionData.message || 'Failed to create checkout session');
        if (sessionData && sessionData.url) {
          window.location.href = sessionData.url;
          return;
        }
        throw new Error('No checkout URL from server');
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || data.message || 'Failed to create payment intent';
        throw new Error(msg);
      }

      const clientSecret = data.clientSecret;
      if (!clientSecret) throw new Error('Missing clientSecret from payment API');

      // verify singleton stripe instance before confirming
      const singletonStripe = await getStripe();
      if (!stripeRef.current || stripeRef.current !== singletonStripe) {
        console.warn('Stripe instance mismatch detected; reinitializing Elements with singleton instance');
        // unmount existing card if present
        try { if (cardRef.current) { cardRef.current.unmount(); cardRef.current = null; cardMountedRef.current = false; } } catch (e) { }
        stripeRef.current = singletonStripe;
        const elements = stripeRef.current.elements();
        elementsRef.current = elements;
        const card = elements.create('card', { hidePostalCode: true });
        card.mount('#card-element');
        cardRef.current = card;
        cardMountedRef.current = true;
        card.on('change', (e) => {
          const display = document.getElementById('card-errors');
          if (display) display.textContent = e.error ? e.error.message : '';
        });
      }
      const stripe = stripeRef.current;
      const card = cardRef.current;
      if (!stripe || !card) throw new Error('Stripe Elements not initialized');

      const billingName = nameOnCard || `${firstName} ${lastName}`.trim();
      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: billingName || undefined,
            email: email || undefined,
            phone: phone || undefined,
          },
        },
      });

      if (confirmResult.error) {
        throw new Error(confirmResult.error.message || 'Payment confirmation failed');
      }

      if (confirmResult.paymentIntent && confirmResult.paymentIntent.status === 'succeeded') {
        // Payment succeeded; clear cart, show thank you, then navigate to order page
        const orderId = data.orderId;
        dispatch(clearCart());
        // show a friendly message before redirect
        setShowThankYou(true);
        setTimeout(() => {
          toast.success('Payment successful');
          navigate(`/order/${orderId}`);
        }, 1800);
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error creating Stripe session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {showThankYou && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
            <p className="text-gray-700 mb-4">Your order has been placed successfully.</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow p-8 space-y-6">
            <h2 className="text-2xl font-bold">Contact </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border p-3 rounded" />
              <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border p-3 rounded" />
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-3 rounded md:col-span-2" />
              <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-3 rounded md:col-span-2" />
            </div>

            <h2 className="text-2xl font-bold">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Address (street)" value={address} onChange={(e) => setAddress(e.target.value)} className="border p-3 rounded md:col-span-2" />
              <input placeholder="Apt, suite (optional)" value={apartment} onChange={(e) => setApartment(e.target.value)} className="border p-3 rounded" />
              <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="border p-3 rounded" />
              <input placeholder="State / Region" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)} className="border p-3 rounded" />
              <input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="border p-3 rounded" />
              <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="border p-3 rounded" />

            </div>
            <div className="mt-3">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={billingOpen} onChange={(e) => setBillingOpen(e.target.checked)} />
                <span className="text-sm">Add separate billing address</span>
              </label>
            </div>
            {billingOpen && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <input placeholder="Billing address (street)" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} className="border p-3 rounded" />
                <input placeholder="Apt, suite (optional)" value={billingApartment} onChange={(e) => setBillingApartment(e.target.value)} className="border p-3 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="City" value={billingCity} onChange={(e) => setBillingCity(e.target.value)} className="border p-3 rounded" />
                  <input placeholder="State / Region" value={billingStateRegion} onChange={(e) => setBillingStateRegion(e.target.value)} className="border p-3 rounded" />
                  <input placeholder="Postal Code" value={billingPostalCode} onChange={(e) => setBillingPostalCode(e.target.value)} className="border p-3 rounded" />
                  <input placeholder="Country" value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} className="border p-3 rounded" />
                </div>
              </div>
            )}
            <h2 className="text-2xl font-bold">Payment</h2>
            <div className="space-y-4">
              <div className="">
                <input placeholder="Name on card" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} className="border p-3 w-full rounded" />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card details</label>
                <div id="card-element" className="border p-3 rounded bg-white"></div>
                <div id="card-errors" role="alert" className="text-red-600 text-sm mt-2"></div>
              </div>
              <div className="flex items-center gap-3">
                <input id="saveDetails" type="checkbox" checked={saveDetails} onChange={(e) => setSaveDetails(e.target.checked)} />
                <label htmlFor="saveDetails" className="text-sm">Save my details for future purchases</label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow p-6 space-y-6 sticky top-24">
            <h3 className="text-xl font-bold">Order Summary</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((i) => (
                <div key={i._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={getImgSrc(i.image)} alt={i.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <div className="font-medium">{i.name}</div>
                      {renderVariantSummary(i)}
                      <div className="text-sm text-gray-900 mt-1">Qty: {i.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold">£{(i.price * i.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-600"><span>Items</span><span>£{totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>£{finalTotal.toFixed(2)}</span></div>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-gradient-to-r from-gray-700 to-black hover:from-gray-900 hover:to-grey-700 text-white py-3 rounded-lg font-bold shadow transition duration-300 transform hover:scale-105">
              {loading ? 'Placing Order…' : `Place Order — £${finalTotal.toFixed(2)}`}
            </button>

            <p className="text-xs text-gray-900">We do not store your CVV. Saved details are stored locally in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
