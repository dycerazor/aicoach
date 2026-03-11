'use client';

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function SessionHistory() {
  const { user } = useUser();
  const db = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'coachingSessions'),
      orderBy('startTime', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: sessions, isLoading } = useCollection(sessionsQuery);

  if (!user) return null;

  return (
    <section className="w-full max-w-7xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-headline font-bold text-slate-900">Recent Sessions</h3>
          <p className="text-slate-500">Review your past growth and AI insights.</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          Last 5 sessions
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center text-sm text-slate-500 gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.startTime?.toDate ? format(session.startTime.toDate(), 'PPP') : 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-slate-500 gap-1">
                        <Clock className="w-4 h-4" />
                        {session.startTime?.toDate ? format(session.startTime.toDate(), 'p') : 'N/A'}
                      </div>
                    </div>
                    
                    {session.summary ? (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex gap-3">
                        <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {session.summary}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-sm">No summary generated for this session.</p>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                    <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                    {session.durationMinutes && (
                      <span className="text-xs font-medium text-slate-400">
                        {Math.round(session.durationMinutes)} min
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed border-2">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
            <h4 className="text-lg font-bold text-slate-600 mb-1">No sessions yet</h4>
            <p className="text-slate-500">Start your first coaching session above to see your history.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
