import React, { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import PhoneAuthModal from './PhoneAuthModal';

const CustomerProtected = ({ children }) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z"/>
              <path d="M8 11l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          
          <div className="text-center max-w-sm">
            <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
              Sign in Required
            </h2>
            <p className="text-text-secondary text-center font-caption mb-6">
              Please sign in to access your account and view your orders.
            </p>
          </div>

          <div className="flex flex-col space-y-3 w-full max-w-sm">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium transition-smooth hover:scale-105 hover:shadow-lg"
            >
              Sign In / Sign Up
            </button>
            
            <button
              className="text-primary underline font-medium"
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>

        <PhoneAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return children;
};

export default CustomerProtected;