import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';
import Header from 'components/ui/Header';
import ProgressIndicator from 'components/ui/ProgressIndicator';
import PhoneAuthModal from 'components/PhoneAuthModal';
import { useAuth } from 'contexts/AuthContext';

const ShoppingCartCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    cuttingFee: 0,
    tax: 0,
    total: 0
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    paymentMethod: 'cash'
  });
  const [activeStep, setActiveStep] = useState('cart'); // 'cart', 'checkout', 'payment', 'confirmation'
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle new item added to cart from customization page
  useEffect(() => {
    if (location.state?.newItem && location.state?.fromCustomization) {
      const newItem = location.state.newItem;
      
      // Check if item already exists in cart
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => 
          item.id === newItem.id && 
          item.customization?.cuttingStyle === newItem.customization?.cuttingStyle
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex].quantity = (updatedItems[existingItemIndex].quantity || 1) + 1;
          return updatedItems;
        } else {
          // Add new item
          return [...prevItems, { ...newItem, quantity: 1 }];
        }
      });
      
      // Clear location state to prevent duplicate additions on refresh
      window.history.replaceState({}, document.title);
    } else {
      // Load cart from localStorage if available
      const savedCart = localStorage.getItem('freshcut_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
          } else {
            // clear corrupted or empty cart
            localStorage.removeItem('freshcut_cart');
          }
        } catch (e) {
          console.error('Error loading cart from localStorage', e);
          localStorage.removeItem('freshcut_cart');
        }
      }
    }
  }, [location.state]);

  // Auto-fill customer info if user is logged in
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || ''
      }));
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('freshcut_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Calculate order summary whenever cart changes
  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.pricing?.total || 0) * (item.quantity || 1);
    }, 0);
    
    const deliveryFee = cartItems.reduce((sum, item) => {
      return sum + (item.pricing?.deliveryFee || 0);
    }, 0);
    
    const cuttingFee = cartItems.reduce((sum, item) => {
      return sum + (item.pricing?.cuttingFee || 0) * (item.quantity || 1);
    }, 0);
    
    const tax = subtotal * 0.05; // 5% tax
    
    setOrderSummary({
      subtotal,
      deliveryFee,
      cuttingFee,
      tax,
      total: subtotal + deliveryFee + tax
    });
  }, [cartItems]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity drops below 1
      handleRemoveItem(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => {
      const updated = prevItems.filter(item => item.id !== itemId);
      if (updated.length === 0) {
        localStorage.removeItem('freshcut_cart');
      } else {
        localStorage.setItem('freshcut_cart', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem('freshcut_cart');
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProceedToCheckout = () => {
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setActiveStep('checkout');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setActiveStep('checkout');
  };

  const handleProceedToPayment = () => {
    setActiveStep('payment');
  };

  const handlePlaceOrder = () => {
    // In a real app, this would submit the order to a backend
    setActiveStep('confirmation');
    
    // Clear cart after successful order
    setCartItems([]);
    localStorage.removeItem('freshcut_cart');
  };

  const renderEmptyCart = () => (
    <div className="py-12 px-4 text-center max-w-md mx-auto">
      <div className="mb-6 bg-surface-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto">
        <Icon name="ShoppingCart" size={48} className="text-text-tertiary" />
      </div>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
        Your Cart is Empty
      </h2>
      <p className="text-text-secondary mb-8">
        Looks like you haven't added any products to your cart yet. Explore our fresh selection of meats and poultry.
      </p>
      <Link 
        to="/product-selection"
        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium transition-smooth hover:shadow-lg hover:scale-105 touch-target"
      >
        <Icon name="ArrowRight" size={20} className="mr-2" />
        Browse Products
      </Link>
    </div>
  );

  const renderCartItems = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-xl font-heading font-semibold text-text-primary">
          Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h2>
        <button 
          onClick={handleClearCart}
          className="text-sm text-error hover:text-error-dark transition-smooth"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {cartItems.map(item => (
          <div key={item.id} className="flex gap-4 py-4 border-b border-border">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-heading font-medium text-text-primary">
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)} - {item.actualWeight}kg
                </h3>
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-text-tertiary hover:text-error transition-smooth"
                >
                  <Icon name="X" size={16} />
                </button>
              </div>
              
              <div className="text-sm text-text-secondary mt-1">
                {item.customization?.cuttingStyle === 'whole' ? 'Whole' : 'Curry Cut'} • 
                {item.customization?.deliveryTime === 'express' ? 'Express Delivery' : 'Standard Delivery'}
              </div>
              
              {item.customization?.specialInstructions && (
                <div className="text-xs text-text-tertiary mt-1 italic">
                  "{item.customization.specialInstructions}"
                </div>
              )}
              
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                    className="flex items-center justify-center w-8 h-8 bg-surface-100 text-text-secondary hover:bg-primary hover:text-white transition-smooth touch-target"
                  >
                    <Icon name="Minus" size={16} />
                  </button>
                  <div className="w-10 h-8 flex items-center justify-center font-medium text-text-primary">
                    {item.quantity || 1}
                  </div>
                  <button
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    className="flex items-center justify-center w-8 h-8 bg-surface-100 text-text-secondary hover:bg-primary hover:text-white transition-smooth touch-target"
                  >
                    <Icon name="Plus" size={16} />
                  </button>
                </div>
                
                <div className="font-data text-primary font-semibold">
                  ₹{((item.pricing?.total || 0) * (item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="card p-6 sticky top-24">
      <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
        Order Summary
      </h3>
      
      <div className="space-y-3 pb-4 border-b border-border">
        <div className="flex justify-between">
          <span className="text-text-secondary">Subtotal</span>
          <span className="font-data font-medium">₹{orderSummary.subtotal.toFixed(2)}</span>
        </div>
        
        {orderSummary.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span className="text-text-secondary">Delivery Fee</span>
            <span className="font-data font-medium">₹{orderSummary.deliveryFee.toFixed(2)}</span>
          </div>
        )}
        
        {orderSummary.cuttingFee > 0 && (
          <div className="flex justify-between">
            <span className="text-text-secondary">Cutting Fee</span>
            <span className="font-data font-medium">₹{orderSummary.cuttingFee.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-text-secondary">Taxes (5%)</span>
          <span className="font-data font-medium">₹{orderSummary.tax.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 pb-6">
        <span className="font-heading font-semibold text-text-primary">Total</span>
        <span className="font-data font-bold text-primary text-xl">₹{orderSummary.total.toFixed(2)}</span>
      </div>
      
      {activeStep === 'cart' && (
        <button
          onClick={handleProceedToCheckout}
          disabled={cartItems.length === 0}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-smooth ${cartItems.length === 0 ? 'bg-surface-200 text-text-tertiary cursor-not-allowed' : 'bg-primary text-white hover:scale-105 hover:shadow-lg'}`}
        >
          Proceed to Checkout
        </button>
      )}
      
      {activeStep === 'checkout' && (
        <button
          onClick={handleProceedToPayment}
          disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-smooth ${!customerInfo.name || !customerInfo.phone || !customerInfo.address ? 'bg-surface-200 text-text-tertiary cursor-not-allowed' : 'bg-primary text-white hover:scale-105 hover:shadow-lg'}`}
        >
          Continue to Payment
        </button>
      )}
      
      {activeStep === 'payment' && (
        <button
          onClick={handlePlaceOrder}
          className="w-full py-3 px-6 rounded-lg font-medium transition-smooth bg-primary text-white hover:scale-105 hover:shadow-lg"
        >
          Place Order
        </button>
      )}
      
      <div className="mt-4 text-center text-sm text-text-tertiary">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="Shield" size={16} className="text-success" />
          <span>Secure checkout</span>
        </div>
        <p>By proceeding, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );

  const renderCustomerInfoForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-xl font-heading font-semibold text-text-primary">
          Delivery Information
        </h2>
        <button 
          onClick={() => setActiveStep('cart')}
          className="text-sm text-primary hover:text-primary-dark transition-smooth flex items-center"
        >
          <Icon name="ArrowLeft" size={16} className="mr-1" />
          Back to Cart
        </button>
      </div>

      {/* User Info Display */}
      {user && (
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary">Logged in as</p>
              <p className="text-sm text-primary-700">
                {user.user_metadata?.phone || user.email}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleCustomerInfoChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleCustomerInfoChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={customerInfo.email}
            onChange={handleCustomerInfoChange}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">
            Delivery Address *
          </label>
          <textarea
            id="address"
            name="address"
            value={customerInfo.address}
            onChange={handleCustomerInfoChange}
            rows="3"
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h2 className="text-xl font-heading font-semibold text-text-primary">
          Payment Method
        </h2>
        <button 
          onClick={() => setActiveStep('checkout')}
          className="text-sm text-primary hover:text-primary-dark transition-smooth flex items-center"
        >
          <Icon name="ArrowLeft" size={16} className="mr-1" />
          Back to Delivery
        </button>
      </div>
      
      <div className="space-y-3">
        {[
          { id: 'cash', label: 'Cash on Delivery', icon: 'Wallet' },
          { id: 'card', label: 'Credit/Debit Card', icon: 'CreditCard' },
          { id: 'upi', label: 'UPI Payment', icon: 'Smartphone' }
        ].map(method => (
          <div 
            key={method.id}
            onClick={() => setCustomerInfo(prev => ({ ...prev, paymentMethod: method.id }))}
            className={`p-4 border rounded-lg cursor-pointer transition-smooth ${customerInfo.paymentMethod === method.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:bg-surface-50'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex items-center justify-center h-10 w-10 rounded-full ${customerInfo.paymentMethod === method.id ? 'bg-primary text-white' : 'bg-surface-100 text-text-tertiary'}`}>
                <Icon name={method.icon} size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-text-primary">{method.label}</div>
                <div className="text-sm text-text-secondary">
                  {method.id === 'cash' && 'Pay when your order is delivered'}
                  {method.id === 'card' && 'Secure online payment'}
                  {method.id === 'upi' && 'Quick payment via UPI apps'}
                </div>
              </div>
              <div className="flex items-center justify-center h-6 w-6 border-2 rounded-full border-border">
                {customerInfo.paymentMethod === method.id && (
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderConfirmation = () => (
    <div className="py-12 px-4 text-center max-w-md mx-auto">
      <div className="mb-6 bg-success-light rounded-full h-24 w-24 flex items-center justify-center mx-auto">
        <Icon name="CheckCircle" size={48} className="text-success" />
      </div>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
        Order Placed Successfully!
      </h2>
      <p className="text-text-secondary mb-8">
        Thank you for your order. We've received your request and will process it shortly.
        You will receive an email confirmation with order details.
      </p>
      <div className="space-y-3">
        <Link 
          to="/order-tracking-status"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white rounded-lg font-medium transition-smooth hover:shadow-lg hover:scale-105 touch-target"
        >
          <Icon name="MapPin" size={20} className="mr-2" />
          Track Your Order
        </Link>
        <Link 
          to="/homepage"
          className="inline-flex items-center justify-center w-full px-6 py-3 border border-border text-text-secondary rounded-lg font-medium transition-smooth hover:bg-surface-100 touch-target"
        >
          <Icon name="Home" size={20} className="mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <ProgressIndicator />
      
      <main className="pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-text-secondary mb-2">
              <Link to="/homepage" className="hover:text-primary transition-smooth">
                Home
              </Link>
              <Icon name="ChevronRight" size={16} />
              <span className="text-primary">Shopping Cart & Checkout</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-primary">
              {activeStep === 'cart' && 'Your Shopping Cart'}
              {activeStep === 'checkout' && 'Checkout'}
              {activeStep === 'payment' && 'Payment'}
              {activeStep === 'confirmation' && 'Order Confirmation'}
            </h1>
          </div>
          
          {/* Empty Cart State */}
          {activeStep === 'cart' && cartItems.length === 0 && renderEmptyCart()}
          
          {/* Cart Items and Checkout */}
          {((activeStep === 'cart' && cartItems.length > 0) || activeStep === 'checkout' || activeStep === 'payment') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {activeStep === 'cart' && renderCartItems()}
                {activeStep === 'checkout' && renderCustomerInfoForm()}
                {activeStep === 'payment' && renderPaymentMethod()}
              </div>
              
              <div className="lg:col-span-1">
                {renderOrderSummary()}
              </div>
            </div>
          )}
          
          {/* Order Confirmation */}
          {activeStep === 'confirmation' && renderOrderConfirmation()}
        </div>
      </main>

      {/* Phone Auth Modal */}
      <PhoneAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ShoppingCartCheckout;