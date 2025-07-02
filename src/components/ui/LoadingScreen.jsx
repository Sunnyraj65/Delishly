import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const LoadingScreen = ({ 
  isVisible = true, 
  stage = 'initializing',
  onComplete 
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  const stages = [
    {
      id: 'initializing',
      label: 'Initializing Application',
      description: 'Setting up the environment...',
      duration: 1000,
      icon: 'Settings'
    },
    {
      id: 'dependencies',
      label: 'Installing Dependencies',
      description: 'Downloading required packages...',
      duration: 3000,
      icon: 'Download'
    },
    {
      id: 'database',
      label: 'Connecting to Database',
      description: 'Establishing Supabase connection...',
      duration: 1500,
      icon: 'Database'
    },
    {
      id: 'loading-data',
      label: 'Loading Product Data',
      description: 'Fetching fresh inventory...',
      duration: 1000,
      icon: 'Package'
    },
    {
      id: 'complete',
      label: 'Ready to Shop',
      description: 'Everything is set up!',
      duration: 500,
      icon: 'CheckCircle'
    }
  ];

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Progress through stages
  useEffect(() => {
    if (!isVisible) return;

    let timeoutId;
    let progressInterval;

    const runStage = (stageIndex) => {
      if (stageIndex >= stages.length) {
        onComplete?.();
        return;
      }

      setCurrentStage(stageIndex);
      setProgress(0);

      // Animate progress bar
      progressInterval = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (stages[stageIndex].duration / 50);
          return Math.min(prev + increment, 100);
        });
      }, 50);

      // Move to next stage
      timeoutId = setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          runStage(stageIndex + 1);
        }, 200);
      }, stages[stageIndex].duration);
    };

    runStage(0);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const currentStageData = stages[currentStage];

  return (
    <div className="fixed inset-0 bg-white z-1200 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icon name="Truck" size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-primary">
            FreshCut Delivery
          </h1>
          <p className="text-text-secondary font-caption">
            Premium Fresh Meat Delivery
          </p>
        </div>

        {/* Current Stage */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon 
              name={currentStageData?.icon || 'Loader'} 
              size={28} 
              className={`text-primary ${currentStageData?.id === 'dependencies' ? 'animate-spin' : ''}`}
            />
          </div>
          
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-2">
            {currentStageData?.label}{dots}
          </h2>
          
          <p className="text-text-secondary font-caption mb-6">
            {currentStageData?.description}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-surface-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stage Progress */}
          <div className="text-sm text-text-tertiary font-caption">
            Step {currentStage + 1} of {stages.length}
          </div>
        </div>

        {/* Dependency Details (when installing) */}
        {currentStageData?.id === 'dependencies' && (
          <div className="bg-surface-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-text-primary mb-3 text-sm">
              Installing Packages
            </h3>
            <div className="space-y-2 text-xs text-text-secondary">
              {[
                '@supabase/supabase-js',
                'react-router-dom',
                'lucide-react',
                'framer-motion',
                'tailwindcss'
              ].map((pkg, index) => (
                <div 
                  key={pkg}
                  className={`flex items-center space-x-2 transition-opacity duration-300 ${
                    progress > (index * 20) ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <Icon 
                    name={progress > (index * 20) ? 'Check' : 'Download'} 
                    size={12} 
                    className={progress > (index * 20) ? 'text-success' : 'text-text-tertiary'}
                  />
                  <span className="font-data">{pkg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Database Connection Details */}
        {currentStageData?.id === 'database' && (
          <div className="bg-surface-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-text-secondary font-caption">
                Connecting to Supabase...
              </span>
            </div>
          </div>
        )}

        {/* Loading Data Details */}
        {currentStageData?.id === 'loading-data' && (
          <div className="bg-surface-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <Icon name="Bird" size={16} className="text-primary mx-auto mb-1" />
                <div className="text-text-secondary font-caption">Chicken</div>
              </div>
              <div className="text-center">
                <Icon name="Fish" size={16} className="text-primary mx-auto mb-1" />
                <div className="text-text-secondary font-caption">Fish</div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-text-tertiary font-caption">
          {currentStageData?.id === 'dependencies' && "This may take a few moments on first load..."}
          {currentStageData?.id === 'database' && "Establishing secure connection..."}
          {currentStageData?.id === 'loading-data' && "Fetching real-time inventory..."}
          {currentStageData?.id === 'complete' && "Welcome to FreshCut Delivery!"}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;