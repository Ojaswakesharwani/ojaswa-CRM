// =============================================================
// AuthGate — Client-side password protection
//
// IMPORTANT SECURITY NOTE:
// This is a client-side privacy gate ONLY. It is NOT real security.
// The password can be discovered by inspecting the source code or
// compiled JavaScript bundle. Do NOT store sensitive or confidential
// data in this application. All data is stored in the browser's
// localStorage and is not encrypted.
// =============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Terminal } from 'lucide-react';

// The password is stored here in plain text — this is intentional
// for a static site "privacy gate". It is NOT secure.
// Change this to your preferred password before deploying.
const STATIC_PASSWORD = 'ojaswa2024';

const SESSION_KEY = 'growth-os-auth';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === 'true') setAuthenticated(true);
    setChecking(false);
  }, []);

  if (checking) return null;

  if (!authenticated) {
    return (
      <LoginScreen
        onSuccess={() => {
          sessionStorage.setItem(SESSION_KEY, 'true');
          setAuthenticated(true);
        }}
      />
    );
  }

  return <>{children}</>;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

// ------------------------------------------------------------------
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const attempt = () => {
    if (value === STATIC_PASSWORD) {
      onSuccess();
    } else {
      setShaking(true);
      setError('Incorrect password. Try again.');
      setTimeout(() => setShaking(false), 600);
      setValue('');
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') attempt();
  };

  return (
    <div className="login-screen">
      <div className="login-bg-grid" />

      {/* Animated background particles */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <circle
            key={i}
            cx={`${15 + i * 15}%`}
            cy={`${20 + (i % 3) * 25}%`}
            r={1.5}
            fill="#10b981"
            style={{
              animation: `pulse ${2 + i * 0.3}s ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </svg>

      <div className="login-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Terminal size={18} color="#000" />
          </div>
          <div className="login-logo">OJASWA</div>
        </div>
        <div className="login-subtitle">Growth OS · Private Dashboard</div>

        {/* Code-like decorative line */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(255,255,255,0.15)',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          $ authenticate --user ojaswa
        </div>

        {/* Error */}
        <div className="login-error" aria-live="polite">{error}</div>

        {/* Input */}
        <div className="login-input-wrap">
          <input
            ref={inputRef}
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            onKeyDown={handleKey}
            placeholder="Enter password"
            className={`login-input ${shaking ? 'error' : ''}`}
            aria-label="Password"
            autoComplete="current-password"
          />
          <button
            className="login-toggle"
            onClick={() => setShow((s) => !s)}
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button className="login-btn" onClick={attempt} type="button">
          Authenticate →
        </button>

        <div className="login-note">
          // CLIENT-SIDE PRIVACY GATE ONLY<br />
          // Not suitable for confidential data.<br />
          // Data stored in browser localStorage.
        </div>
      </div>
    </div>
  );
}
