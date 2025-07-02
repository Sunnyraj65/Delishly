import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from 'components/AppIcon';

import Header from 'components/ui/Header';
import LoadingScreen from 'components/ui/LoadingScreen';
import HeroBanner from './components/HeroBanner';
import CallToActionButtons from './components/CallToActionButtons';
import HighlightsSection from './components/HighlightsSection';
import TrustIndicators from './components/TrustIndicators';
import useOrders from 'hooks/useOrders';

const Homepage = () => {
  const { hasOrders } = useOrders();
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const quickLinks = [
    { label: 'Order Chicken', path: '/product-selection' },
    { label: 'Order Fish', path: '/product-selection' },
    ...(hasOrders ? [{ label: 'Track Order', path: '/order-tracking-status' }] : []),
    { label: 'My Account', path: '/user-account-profile' }
  ];

  // Handle loading screen completion
  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  // Show loading screen on first visit
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      
      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <HeroBanner />
        
        {/* Call to Action Buttons */}
        <CallToActionButtons />
        
        {/* Highlights Section */}
        <HighlightsSection />
        
        {/* Trust Indicators */}
        <TrustIndicators />
        
        {/* Footer */}
        <footer className="bg-white border-t border-border mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="Truck" size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-semibold text-primary">
                      FreshCut Delivery
                    </h3>
                    <p className="text-sm text-text-secondary font-caption">
                      Fresh. Fast. Delivered.
                    </p>
                  </div>
                </div>
                <p className="text-text-secondary mb-4 font-caption">
                  Premium live poultry and seafood delivery service with real-time inventory, custom cutting options, and 2-hour delivery guarantee.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Phone" size={16} />
                    <span className="font-data">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-text-secondary">
                    <Icon name="Mail" size={16} />
                    <span className="font-data">hello@freshcut.com</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="font-heading font-semibold text-text-primary mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  {quickLinks.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-text-secondary hover:text-primary transition-smooth font-caption"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Service Hours */}
              <div>
                <h4 className="font-heading font-semibold text-text-primary mb-4">Service Hours</h4>
                <div className="space-y-2 text-sm text-text-secondary font-caption">
                  <div className="flex justify-between">
                    <span>Mon - Fri:</span>
                    <span className="font-data">6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-data">7:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-data">8:00 AM - 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border mt-8 pt-8 text-center">
              <p className="text-text-tertiary text-sm font-caption">
                © {new Date().getFullYear()} FreshCut Delivery. All rights reserved. | Privacy Policy | Terms of Service
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Homepage;