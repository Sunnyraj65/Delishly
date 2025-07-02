import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import useOrders from 'hooks/useOrders';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // Load and watch cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const savedCart = localStorage.getItem('freshcut_cart');
        if (savedCart) {
          const items = JSON.parse(savedCart);
          if (Array.isArray(items)) {
            const count = items.reduce((c, item) => c + (item.quantity || 1), 0);
            setCartCount(count);
          } else {
            setCartCount(0);
          }
        } else {
          setCartCount(0);
        }
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
        setCartCount(0);
      }
    };

    // Initial load
    loadCartCount();
    
    // Poll for changes every second (localStorage event not reliable across tabs in same window)
    const interval = setInterval(loadCartCount, 1000);
    
    // Also listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'freshcut_cart') {
        loadCartCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  let navigationItems = [
    {
      label: 'Shop',
      path: '/homepage',
      icon: 'Store',
      description: 'Browse fresh products'
    },
    {
      label: 'Cart',
      path: '/shopping-cart-checkout',
      icon: 'ShoppingCart',
      badge: cartCount,
      description: 'View cart and checkout'
    },
    {
      label: 'Orders',
      path: '/order-tracking-status',
      icon: 'Package',
      description: 'Track your orders'
    },
    {
      label: 'Account',
      path: '/user-account-profile',
      icon: 'User',
      description: 'Manage your profile'
    }
  ];

  // Hide the Orders link if the user has no previous orders
  const { hasOrders } = useOrders();
  if (!hasOrders) {
    navigationItems = navigationItems.filter(item => item.path !== '/order-tracking-status');
  }

  const isActivePath = (path) => {
    if (path === '/homepage') {
      return location.pathname === '/' || location.pathname === '/homepage';
    }
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-1000 bg-white border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/homepage" 
            className="flex items-center space-x-3 transition-smooth hover:opacity-80"
            onClick={closeMenu}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-white"
                fill="currentColor"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
                <path d="M8 11l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-heading font-semibold text-primary">
                FreshMeat
              </h1>
              <p className="text-xs text-text-secondary font-caption">
                Premium Quality
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth touch-target ${
                  isActivePath(item.path)
                    ? 'bg-primary-50 text-primary border border-primary-200' :'text-text-secondary hover:text-primary hover:bg-primary-50'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center pulse-availability">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-50 transition-smooth touch-target"
            aria-label="Toggle navigation menu"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border shadow-large animate-fade-in">
          <nav className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth touch-target ${
                  isActivePath(item.path)
                    ? 'bg-primary-50 text-primary border border-primary-200' :'text-text-secondary hover:text-primary hover:bg-primary-50'
                }`}
              >
                <Icon name={item.icon} size={20} />
                <div className="flex-1">
                  <span className="font-medium block">{item.label}</span>
                  <span className="text-sm text-text-tertiary font-caption">
                    {item.description}
                  </span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-accent text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center pulse-availability">
                    {item.badge}
                  </span>
                )}
                <Icon name="ChevronRight" size={16} className="text-text-tertiary" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;