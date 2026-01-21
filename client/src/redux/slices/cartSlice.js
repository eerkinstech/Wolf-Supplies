import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  if (!token) return [];
  try {
    const res = await axios.get(`${API}/api/cart`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = res.data;
    // Normalize server items to client shape
    const items = (data.items || []).map((it) => {
      const product = it.product || null;
      return {
        _id: it._id || (product && (product._id || product.id)) || it.product || '',
        product: (product && (product._id || product.id)) || it.product || '',
        name: it.name || (product && product.name) || '',
        price: Number(it.price ?? (product && product.price) ?? 0),
        image: it.image || (product && (product.image || (product.images && product.images[0]))) || '',
        quantity: it.quantity || 1,
        selectedVariants: it.selectedVariants || {},
      };
    });
    return items;
  } catch (err) {
    console.error('fetchCart error', err);
    return [];
  }
});

export const syncCart = createAsyncThunk('cart/syncCart', async (items, thunkAPI) => {
  const token = localStorage.getItem('token');
  if (!token) return items;
  try {
    // Convert client items to server-friendly shape: ensure `product` field is set to product id
    const extractProductId = (it) => {
      if (!it) return undefined;
      if (it.product) return it.product;
      if (typeof it._id === 'string') {
        // handle composite client _id like '<productId>|size:...'
        const candidate = it._id.includes('|') ? it._id.split('|')[0] : it._id;
        return candidate;
      }
      return undefined;
    };

    const serverItems = (items || []).map((it) => ({
      product: extractProductId(it) || undefined,
      name: it.name,
      quantity: it.quantity || 1,
      price: it.price,
      selectedVariants: it.selectedVariants || {},
      image: it.image || '',
    }));

    const res = await axios.post(`${API}/api/cart`, 
      { items: serverItems },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = res.data;
    // Normalize returned items to client shape just like fetchCart
    const returned = (data.items || []).map((it) => {
      const product = it.product || null;
      return {
        _id: it._id || (product && (product._id || product.id)) || it.product || '',
        product: (product && (product._id || product.id)) || it.product || '',
        name: it.name || (product && product.name) || '',
        price: Number(it.price ?? (product && product.price) ?? 0),
        image: it.image || (product && (product.image || (product.images && product.images[0]))) || '',
        quantity: it.quantity || 1,
        selectedVariants: it.selectedVariants || {},
      };
    });
    return returned;
  } catch (err) {
    console.error('syncCart error', err);
    return items;
  }
});

export const clearServerCart = createAsyncThunk('cart/clearServerCart', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  if (!token) return [];
  try {
    const res = await axios.delete(`${API}/api/cart`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = res.data;
    return data.items || [];
  } catch (err) {
    console.error('clearServerCart error', err);
    return [];
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
      const existingItem = state.items.find((i) => i._id === item._id);

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
// Thunks are exported at declaration (`export const ...`) so no re-export is needed here.
