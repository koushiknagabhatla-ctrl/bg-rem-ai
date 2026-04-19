'use client';
import { useState } from 'react';
import { createBrowserSupabaseClient } from '../lib/supabase';

export function AuthPanel() {
    const supabase = createBrowserSupabaseClient();
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/auth/callback' }
        });
    };

    const signInWithEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/auth/callback' }});
        if (error) setMsg(error.message);
        else setMsg("Check your email!");
    };

    return (
        <div className="glass-card p-8 flex flex-col md:flex-row gap-8 max-w-2xl mx-auto w-full">
            <div className="flex-1 text-center border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                <h3 className="text-xl font-semibold mb-4">Quick Sign In</h3>
                <button onClick={signInWithGoogle} className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition">
                    Continue with Google
                </button>
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 text-center">Magic Link</h3>
                <form onSubmit={signInWithEmail} className="flex flex-col gap-3">
                    <input type="email" placeholder="Your email address" required value={email} onChange={e=>setEmail(e.target.value)}
                           className="bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent" />
                    <button type="submit" className="bg-gradient-to-r from-accent to-accent-light text-white font-semibold py-3 rounded-xl hover:opacity-90 transition">
                        Send Magic Link
                    </button>
                    {msg && <p className="text-sm text-center text-zinc-400">{msg}</p>}
                </form>
            </div>
        </div>
    );
}
