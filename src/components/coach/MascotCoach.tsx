'use client';

import dynamic from 'next/dynamic';
import { BrainCircuit } from 'lucide-react';

/**
 * A safe client-side wrapper for the AI coach interface.
 * Uses dynamic import with ssr: false to prevent Simli client errors during server rendering.
 */
const DynamicMascotCoach = dynamic(
  () => import('./MascotCoachInterface').then((mod) => mod.MascotCoachInterface),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl flex items-center justify-center border-4 border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <BrainCircuit className="w-12 h-12 text-accent animate-pulse" />
          <p className="text-slate-400 font-medium">Loading AI Coach...</p>
        </div>
      </div>
    )
  }
);

export function MascotCoach() {
  return <DynamicMascotCoach />;
}
