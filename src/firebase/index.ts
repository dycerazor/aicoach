'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from '@/firebase/config';

/**
 * Initializes Firebase services with a robust fallback system.
 * 
 * In App Hosting environments, it first attempts to initialize using the internal 
 * environment configuration. If that fails (e.g., during build or early boot), 
 * it falls back to the static config.
 */
export function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    return getSdks(getApp());
  }

  let app: FirebaseApp;

  try {
    // Standard App Hosting automatic initialization
    app = initializeApp();
  } catch (error: any) {
    // Fallback to static config for development or early-stage deployment
    try {
      app = initializeApp(firebaseConfig);
    } catch (manualInitError: any) {
      // If we are already initialized somehow, return the existing app
      const existingApps = getApps();
      if (existingApps.length > 0) {
        app = existingApps[0];
      } else {
        console.warn('Firebase initialization delayed or failed. Falling back to default app.');
        // Return a mock or handle gracefully in layout
        throw manualInitError;
      }
    }
  }

  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
