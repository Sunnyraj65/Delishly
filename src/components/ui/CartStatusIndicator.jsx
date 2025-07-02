import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const CartStatusIndicator = () => {
  const [cartData, setCartData] = useState({
    itemCount: 0,
    totalPrice: 0,
    hasChanges: false
  });

  // Load cart data from localStorage
  useEffect(() => {
    const loadCartData = () => {
      try {
        const savedCart = localStorage.getItem('freshcut_cart');
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          if (Array.isArray(cartItems)) {
            const itemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
            const totalPrice = cartItems.reduce((sum, item) => {
              return sum + (item.pricing?.total || 0) * (item.quantity || 1);
            }, 0);

            setCartData(prev => {
              const hasChanges = prev.itemCount !== itemCount;
              if (hasChanges) {
                // flash animation reset later
                setTimeout(() => {
                  setCartData(p => ({ ...p, hasChanges: false }));
                }, 1000);
              }
              return { itemCount, totalPrice, hasChanges };
            });
          } else {
            setCartData({
              itemCount: 0,
              totalPrice: 0,
              hasChanges: false
            });
          }
        } else {
          setCartData({
            itemCount: 0,
            totalPrice: 0,
            hasChanges: false
          });
        }
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
        setCartData({
          itemCount: 0,
          totalPrice: 0,
          hasChanges: false
        });
      }
    };

    // Initial load
    loadCartData();
    
    // Set up interval to check for cart changes
    const interval = setInterval(loadCartData, 1000);
    
    // Also listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'freshcut_cart') {
        loadCartData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (cartData.itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-1000 md:hidden">
      <Link
        to="/shopping-cart-checkout"
        className={`flex items-center space-x-3 bg-primary text-white px-4 py-3 rounded-lg shadow-large transition-smooth hover:scale-105 touch-target ${cartData.hasChanges ? 'animate-pulse' : ''}`}
      >
        <div className="relative">
          <Icon name="ShoppingCart" size={20} />
          <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartData.itemCount}
          </span>
        </div>
        <div className="text-sm">
          <div className="font-medium">View Cart</div>
          <div className="font-data text-xs opacity-90">
            ₹{cartData.totalPrice.toFixed(2)}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CartStatusIndicator;