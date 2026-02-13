'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { googleAuthAdmin } from '@/redux/slices/adminAuthSlice';

interface GoogleOAuthButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          prompt: (callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '485325288859-f9c60cnlta5or3pcuipm03brfm368vu8.apps.googleusercontent.com';

export default function GoogleOAuthButtonAdmin({ 
  onSuccess, 
  onError, 
  className = '',
  children 
}: GoogleOAuthButtonProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.adminAuth);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      const result = await dispatch(googleAuthAdmin(response.credential)).unwrap();
      console.log('Google admin authentication successful:', result);
      onSuccess?.();
    } catch (error) {
      console.error('Google admin authentication failed:', error);
      onError?.(error as string);
    }
  }, [dispatch, onSuccess, onError]);

  const initializeGoogleSignIn = useCallback(() => {
    if (window.google && !isInitialized.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false, // Disable FedCM to avoid the abort error
        });
        
        // Render the button if we have a ref element
        if (googleButtonRef.current && !children) {
          // Clear any existing content first
          googleButtonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: '100%',
          });
        }
        
        isInitialized.current = true;
        console.log('Google Sign-In initialized successfully (Admin)');
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    }
  }, [handleCredentialResponse, children]);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Increase delay to ensure the script is fully loaded and ready
        setTimeout(() => {
          initializeGoogleSignIn();
          // Add another small delay to ensure button is rendered
          setTimeout(() => {
            console.log('Google admin button should be ready now');
          }, 200);
        }, 300);
      };

      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        onError?.('Failed to load Google authentication');
      };

      document.head.appendChild(script);
    };

    loadGoogleScript();

    // Cleanup function
    return () => {
      if (window.google?.accounts?.id?.disableAutoSelect) {
        window.google.accounts.id.disableAutoSelect();
      }
      isInitialized.current = false;
    };
  }, [initializeGoogleSignIn, onError]);

  const handleGoogleSignIn = useCallback(() => {
    // If not initialized yet, try to initialize first
    if (window.google && !isInitialized.current) {
      console.log('Initializing Google Sign-In on click (Admin)...');
      initializeGoogleSignIn();
      // Wait a bit and try again
      setTimeout(() => {
        if (window.google && isInitialized.current) {
          window.google.accounts.id.prompt();
        }
      }, 500);
      return;
    }

    if (window.google && isInitialized.current) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google Sign-In prompt was not displayed or skipped');
            // Fallback: try to show the popup directly
            // You might want to show a custom modal or redirect to Google OAuth flow here
          }
        });
      } catch (error) {
        console.error('Error showing Google Sign-In prompt:', error);
        onError?.('Failed to show Google Sign-In prompt');
      }
    } else {
      console.warn('Google Sign-In not initialized yet');
      // Try to initialize and prompt again
      if (window.google) {
        initializeGoogleSignIn();
        setTimeout(() => {
          if (window.google && isInitialized.current) {
            window.google.accounts.id.prompt();
          }
        }, 500);
      } else {
        onError?.('Google Sign-In is not ready. Please try again.');
      }
    }
  }, [onError, initializeGoogleSignIn]);

  if (children) {
    // Custom button
    return (
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={className}
      >
        {children}
      </button>
    );
  }

  // Default Google button - use the rendered Google button or fallback to custom
  return (
    <div className={`google-signin-container ${className}`}>
      {/* Google's rendered button */}
      <div ref={googleButtonRef} className="google-rendered-button" />
      
      {/* Fallback custom button - always hidden since we use Google's button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
        style={{ display: 'none' }}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="#4285f4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34a853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#fbbc05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#ea4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading ? 'Signing in...' : 'Continue with Google'}
      </button>
    </div>
  );
}