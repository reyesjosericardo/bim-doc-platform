'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function CubeMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden role="img">
      <path d="M 100 30 L 160 65 L 100 100 L 40 65 Z" fill="#EEE9DB" />
      <path d="M 40 65 L 100 100 L 100 170 L 40 135 Z" fill="#8FA88E" />
      <path d="M 100 100 L 160 65 L 160 135 L 100 170 Z" fill="#6B8068" />
    </svg>
  );
}

const inputCls =
  'w-full rounded-[4px] bg-[#EEE9DB]/[0.03] border border-[#EEE9DB]/15 px-3 py-2.5 text-sm text-[#EEE9DB] placeholder-[#EEE9DB]/30 focus:border-[#8FA88E]/60 focus:outline-none focus:ring-1 focus:ring-[#8FA88E]/40 transition';
const labelCls = 'block font-code text-[10px] tracking-[0.18em] uppercase text-[#8FA88E]/70 mb-1.5';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="bp-canvas min-h-screen flex items-center justify-center px-4 relative">
      <div className="brand-grid fixed inset-0 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Brand header */}
        <div className="text-center mb-8">
          <CubeMark className="w-14 h-14 mx-auto mb-5" />
          <h1 className="font-display text-[1.75rem] tracking-[0.13em] text-[#EEE9DB]">INCOESTRUCTURA</h1>
          <div className="flex items-center justify-center gap-2.5 mt-2">
            <span className="font-code text-[10px] text-[#8FA88E]/70 tracking-[0.22em] uppercase">BIM·Doc</span>
            <span className="h-3 w-px bg-[#EEE9DB]/15" />
            <span className="font-code text-[10px] text-[#EEE9DB]/40 tracking-[0.18em] uppercase">ISO 19650</span>
          </div>
        </div>

        {/* Sign-in panel */}
        <div className="bp-panel p-7">
          <div className="flex items-center gap-3 mb-6">
            <span className="bp-eyebrow">Acceso</span>
            <span className="bp-rule flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="tu@organizacion.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>Contraseña</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-[4px] bg-[#B5805E]/10 border border-[#B5805E]/30 px-4 py-3 text-sm text-[#D8A98C]">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-cta-lg w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center font-code text-[10px] text-[#EEE9DB]/30 mt-6 tracking-wide">
          Plataforma documental BIM · ISO 19650-1 / 19650-2
        </p>
      </div>
    </div>
  );
}
