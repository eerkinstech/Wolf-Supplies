import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {const token = localStorage.getItem('token');try {
    // Fetch from server with or without token (server handles both via guestId or userId)
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API}/api/cart`, { headers });const data = res.data;
    const items = (data.items || []).map((it) => {
      const product = it.product || null;
      return {
        _id: it._id || (product && (product._id || product.id)) || it.product || '',
        product: (product && (product._id || product.id)) || it.product || '',
        name: it.name || (product && product.name) || '',
        price: Number(it.price ?? (product && product.price) ?? 0),
        image: it.image || (product && (product.image || (product.images && product.images[0]))) || '',
        variantImage: it.variantImage || null,
        quantity: it.quantity || 1,
        selectedVariants: it.selectedVariants || {},
        selectedSize: it.selectedSize || null,
        selectedColor: it.selectedColor || null,
        variant: it.variant || null,
        sku: it.sku || null,
        colorCode: it.colorCode || null,
      };
    });
    return items;
  } catch (err) {return [];
  }
});

export const syncCart = createAsyncThunk('cart/syncCart', async (items, thunkAPI) => {
  const token = localStorage.getItem('token');

  try {
    const extractProductId = (it) => {
      if (!it) return undefined;
      if (it.product) return it.product;
      if (typeof it._id === 'string') {
        const candidate = it._id.includes('|') ? it._id.split('|')[0] : it._id;
        return candidate;
      }
      return undefined;
    };

    // Deduplicate items: combine items with same product + variants
    const deduped = {};
    for (const it of (items || [])) {
      const productId = extractProductId(it);
      const variantKey = JSON.stringify({
        product: productId,
        size: it.selectedSize || '',
        color: it.selectedColor || '',
        variants: it.selectedVariants || {}
      });

      if (deduped[variantKey]) {
        deduped[variantKey].quantity += it.quantity || 1;
      } else {
        deduped[variantKey] = {
          product: productId || undefined,
          name: it.name,
          quantity: it.quantity || 1,
          price: it.price,
          selectedVariants: it.selectedVariants || {},
          selectedSize: it.selectedSize || null,
          selectedColor: it.selectedColor || null,
          image: it.image || '',
          variantImage: it.variantImage || null,
          variant: it.variant || null,
          sku: it.sku || null,
          colorCode: it.colorCode || null,
        };
      }
    }

    const serverItems = Object.values(deduped);

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const payload = { items: serverItems };

    const res = await axios.post(`${API}/api/cart`, payload, { headers });
    const data = res.data;

    // Normalize returned items to client shape
    const returned = (data.items || []).map((it) => {
      const product = it.product || null;
      return {
        _id: it._id || (product && (product._id || product.id)) || it.product || '',
        product: (product && (product._id || product.id)) || it.product || '',
        name: it.name || (product && product.name) || '',
        price: Number(it.price ?? (product && product.price) ?? 0),
        image: it.image || (product && (product.image || (product.images && product.images[0]))) || '',
        variantImage: it.variantImage || null,
        quantity: it.quantity || 1,
        selectedVariants: it.selectedVariants || {},
        selectedSize: it.selectedSize || null,
        selectedColor: it.selectedColor || null,
        variant: it.variant || null,
        sku: it.sku || null,
        colorCode: it.colorCode || null,
      };
    });
    return returned;
  } catch (err) {return items;
  }
});

export const clearServerCart = createAsyncThunk('cart/clearServerCart', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');

  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.delete(`${API}/api/cart`, {
      headers
    });
    const data = res.data;
    return data.items || [];
  } catch (err) {return [];
  }
});

const initialState = {
  items: [],
  totalPrice: 0,
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
    },
    addToCart: (state, action) => {
      const item = action.payload;

      // Helper to check if two items are the same (same product + same variants)
      const isSameItem = (a, b) => {
        if (!a || !b) return false;
        if ((a.product || a._id) !== (b.product || b._id)) return false;
        if ((a.selectedSize || '') !== (b.selectedSize || '')) return false;
        if ((a.selectedColor || '') !== (b.selectedColor || '')) return false;
        const va = a.selectedVariants || {};
        const vb = b.selectedVariants || {};
        const ka = Object.keys(va).sort();
        const kb = Object.keys(vb).sort();
        if (ka.length !== kb.length) return false;
        for (let i = 0; i < ka.length; i++) {
          if (ka[i] !== kb[i] || String(va[ka[i]]) !== String(vb[kb[i]])) return false;
        }
        return true;
      };

      const existingItem = state.items.find((i) => isSameItem(i, item));

      if (existingItem) {
        existingItem.quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }

      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i._id !== id);
        } else {
          item.quantity = quantity;
        }
      }

      state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
      state.totalPrice = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalQuantity = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
        state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload) ? action.payload : [];
        state.items = items.map((i) => ({ ...i, quantity: i.quantity || 1 }));
        state.totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        state.totalPrice = state.items.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0);
      })
      .addCase(clearServerCart.fulfilled, (state, action) => {
        state.items = [];
        state.totalPrice = 0;
        state.totalQuantity = 0;
      });
  },
});

export const { setCart, addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;