'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Provides Firebase services to the client.
 * 
 * This provider ensures that Firebase is initialized correctly and shared 
 * across the application. It handles the potential mismatch between 
 * server-side rendering and client-side execution.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Firebase services. 
  // initializeFirebase handles singleton logic internally, so this is safe.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  // We render the provider immediately. The internal 'useUser' and auth listener 
  // logic in FirebaseProvider will handle the transition from 'loading' to 
  // 'authenticated' state once the client-side Firebase SDK is fully ready.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
