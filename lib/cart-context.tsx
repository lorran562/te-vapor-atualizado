'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface CartItem {
  cartId: string;
  id: string;
  brand: string;
  model: string;
  price: number;
  puffs?: string;
  image: string;
  flavor: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'cartId' | 'quantity'>, quantity?: number) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 't7vapor_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      console.error('Erro lendo carrinho salvo:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Erro salvando carrinho:', e);
    }
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addItem = useCallback((item: Omit<CartItem, 'cartId' | 'quantity'>, quantity: number = 1) => {
    setItems(prev => {
      const cartId = `${item.id}__${item.flavor}`;
      const existing = prev.find(i => i.cartId === cartId);
      if (existing) {
        return prev.map(i => i.cartId === cartId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, cartId, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.cartId !== cartId));
      return;
    }
    setItems(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isCartOpen, openCart, closeCart,
      addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return ctx;
}
