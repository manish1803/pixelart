'use client';

import { Github } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground"
      style={{ fontFamily: "'Geist Mono', monospace" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-3 h-3 border border-border" />
          <div className="w-3 h-3 bg-[#00FF41]" />
          <div className="w-3 h-3 border border-border" />
          <div className="w-3 h-3 border border-border" />
        </div>
        <span className="text-2xl font-bold tracking-tighter text-foreground">pixel</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm border border-border p-8 flex flex-col gap-6 bg-panel">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Sign In</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-1">
            Sync your projects across devices
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* GitHub */}
          <button
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full flex items-center gap-3 h-11 px-4 border border-border transition-colors hover:border-foreground hover:bg-foreground/5 text-foreground"
          >
            <Github className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Continue with GitHub</span>
          </button>

          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center gap-3 h-11 px-4 border border-border transition-colors hover:border-foreground hover:bg-foreground/5 text-foreground"
          >
            {/* Google G icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-4">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted text-center">
            Guest mode — draw without signing in
          </p>
          <a
            href="/"
            className="block mt-3 w-full text-center text-[9px] font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B0B]" />}>
      <SignInContent />
    </Suspense>
  );
}
