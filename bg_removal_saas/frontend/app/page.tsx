'use client';
import { useEffect, useState } from 'react';
import { AuthPanel } from '../components/AuthPanel';
import { CreditDisplay } from '../components/CreditDisplay';
import { DropZone } from '../components/DropZone';
import { ComparisonSlider } from '../components/ComparisonSlider';
import { DownloadButton } from '../components/DownloadButton';
import { createBrowserSupabaseClient } from '../lib/supabase';

export default function Home() {
    const supabase = createBrowserSupabaseClient();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [triggerTime, setTriggerTime] = useState(Date.now());

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, [supabase]);

    if (loading) return <div className="text-center mt-32 animate-pulse">Loading engine...</div>;

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                        Remove Backgrounds <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">Instantly</span>
                    </h1>
                    <p className="text-xl text-zinc-400">AI-powered, 40ms per image.</p>
                </div>
                <AuthPanel />
            </div>
        );
    }

    const handleResult = (res: any) => {
        setResult(res);
        setTriggerTime(Date.now()); // trigger credit update
    };

    return (
        <div className="flex flex-col items-center gap-12 pb-24">
            <CreditDisplay triggerTime={triggerTime} />
            
            <div className="text-center pt-8">
                <h1 className="text-3xl font-bold mb-2">Workspace</h1>
                <p className="text-zinc-400">Upload any image. 5 credits per removal.</p>
            </div>

            {!result ? (
                <DropZone onResult={handleResult} />
            ) : (
                <div className="w-full flex flex-col items-center gap-8 fade-in">
                    <ComparisonSlider original={result.original} resultUrl={result.resultUrl} />
                    <DownloadButton resultUrl={result.resultUrl} reset={() => setResult(null)} />
                </div>
            )}
        </div>
    );
}
