import React, { useState } from 'react';
import Icon from './AppIcon';
import { useAuth } from 'contexts/AuthContext';

const PhoneAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app, you would send OTP via SMS
      // For demo purposes, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes, we'll create a proper email/password combination
      // that follows standard email format and use a consistent password
      const email = `user${phoneNumber}@freshcut.demo`;
      const password = `FreshCut2024!${phoneNumber}`;

      try {
        // Try to sign in first
        await signIn(email, password);
      } catch (signInError) {
        // If sign in fails, create new account with proper password requirements
        try {
          await signUp(email, password, {
            phone: phoneNumber,
            auth_method: 'phone',
            full_name: `User ${phoneNumber}`
          });
        } catch (signUpError) {
          // If both fail, it might be a validation issue
          throw new Error('Authentication failed. Please try again.');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      // Simulate resending OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError('');
      // Show success message briefly
      setError('OTP sent successfully!');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-1200">
      <div className="bg-white rounded-xl p-6 w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-100 text-text-secondary hover:bg-surface-200 transition-smooth"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Icon name="Truck" size={24} className="text-white" />
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-100 text-text-secondary hover:bg-surface-200 transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            India's fresh meat app
          </h2>
          <p className="text-text-secondary font-caption">
            {step === 'phone' ? 'Log in or Sign up' : 'Enter OTP'}
          </p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <div className="flex items-center border-2 border-border rounded-lg overflow-hidden focus-within:border-primary transition-smooth">
                <div className="px-4 py-3 bg-surface-50 text-text-secondary font-medium border-r border-border">
                  +91
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                    setError('');
                  }}
                  placeholder="Enter mobile number"
                  className="flex-1 px-4 py-3 text-lg font-medium focus:outline-none"
                  maxLength={10}
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-error">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className={`w-full py-4 rounded-lg font-medium text-lg transition-smooth ${
                loading || phoneNumber.length < 10
                  ? 'bg-surface-200 text-text-tertiary cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending OTP...</span>
                </div>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <p className="text-text-secondary mb-4 font-caption">
                We've sent a 6-digit OTP to <span className="font-medium text-text-primary">+91 {phoneNumber}</span>
              </p>
              
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 text-lg font-medium text-center border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-smooth tracking-widest"
                maxLength={6}
                autoFocus
              />
              
              {error && (
                <p className={`mt-2 text-sm ${error.includes('sent successfully') ? 'text-success' : 'text-error'}`}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className={`w-full py-4 rounded-lg font-medium text-lg transition-smooth ${
                loading || otp.length < 6
                  ? 'bg-surface-200 text-text-tertiary cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-primary hover:text-primary-700 font-medium transition-smooth disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-tertiary font-caption">
            By continuing, you agree to our{' '}
            <button className="text-primary underline">Terms of service</button>
            {' '}&{' '}
            <button className="text-primary underline">Privacy policy</button>
          </p>
        </div>

        {/* Demo Info */}
        {step === 'otp' && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-xs text-primary-700 text-center font-caption">
              <Icon name="Info" size={14} className="inline mr-1" />
              Demo: Enter any 6-digit number as OTP
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneAuthModal;