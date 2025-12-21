import { useState, useEffect, useCallback } from 'react';
import { cartApi } from '../utils/api';

export function useCart() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalQuantity: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
      return;
    }

    setIsLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch (error) {
      console.error('장바구니 조회 실패:', error);
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cart-update', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-update', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setIsLoading(true);
    try {
      const data = await cartApi.add(productId, quantity);
      setCart(data.cart);
      window.dispatchEvent(new Event('cart-update'));
      return data;
    } catch (error) {
      console.error('장바구니 추가 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setIsLoading(true);
    try {
      const data = await cartApi.updateQuantity(productId, quantity);
      setCart(data.cart);
      window.dispatchEvent(new Event('cart-update'));
      return data;
    } catch (error) {
      console.error('수량 변경 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    try {
      const data = await cartApi.remove(productId);
      setCart(data.cart);
      window.dispatchEvent(new Event('cart-update'));
      return data;
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const data = await cartApi.clear();
      setCart(data.cart);
      window.dispatchEvent(new Event('cart-update'));
      return data;
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cart,
    items: cart.items || [],
    totalPrice: cart.totalPrice || 0,
    totalQuantity: cart.totalQuantity || 0,
    isLoading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}

export default useCart;
