'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Trash2, RotateCcw, Sparkles, Upload, ArrowLeft } from 'lucide-react';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { DownloadButton } from '@/components/DownloadButton';
import { CreditDisplay } from '@/components/CreditDisplay';
import { CinematicIntro } from '@/components/ui/intro-sequence';
import Link from 'next/link';

export function Workspace() {
  const supabase = createBrowserSupabaseClient();
  const [apiStatus, setApiStatus] = useState('');
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [triggerTime, setTriggerTime] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<'input' | 'output'>('input');
  const { previewUrl, fileName, fileObject, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } = useImageUpload();

  useEffect(() => { if (previewUrl && !resultUrl) setOriginalUrl(previewUrl); }, [previewUrl, resultUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) { handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>); setResultUrl(null); setError(''); }
  }, [handleFileChange]);

  const resetAll = () => { handleRemove(); setResultUrl(null); setOriginalUrl(null); setTab('input'); setError(''); };

  const runExtraction = async () => {
    if (!fileObject) return;
    if (fileObject.size > 4.5 * 1024 * 1024) { setError('Max file size 4.5MB.'); return; }
    setApiStatus('Uploading...'); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please sign in first'); setApiStatus(''); return; }
      setApiStatus('Processing...');
      const formData = new FormData(); formData.append('image', fileObject);
      const response = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: formData });
      if (!response.ok) {
        let errObj: any = {}; try { errObj = await response.json(); } catch (e) {}
        if (response.status === 402) setError('No credits remaining.');
        else if (response.status === 504) setError('Server waking up. Try in 30s.');
        else if (response.status === 429) setError('Too many requests. Please wait.');
        else setError(errObj.detail || errObj.error || 'Something went wrong.');
        setApiStatus(''); return;
      }
      const data = await response.json();
      if (data.result_url) { setResultUrl(data.result_url); setTab('output'); setTriggerTime(Date.now()); }
      else setError('Processing failed.');
    } catch (e: any) { setError(e.message || 'Network error'); }
    setApiStatus('');
  };

  return (
    <CinematicIntro>
      <div className="w-full min-h-screen bg-cream selection:bg-ink selection:text-cream">
        <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-20">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-ink/50 hover:text-ink text-sm font-bold transition-colors duration-300 mb-6">
                <ArrowLeft className="w-4 h-4" /> Return Home
              </Link>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-ink mb-2">Studio</h1>
              <p className="text-sm font-bold text-ink/50 tracking-widest uppercase">Upload <span className="mx-1">→</span> Process <span className="mx-1">→</span> Download</p>
            </div>
            <CreditDisplay triggerTime={triggerTime} />
          </motion.div>

          {/* Canvas Wrapper */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            
            {/* Left Area - Viewer */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="bg-ink/[0.02] border border-ink/[0.08] rounded-[2.5rem] min-h-[600px] flex flex-col overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <div className="flex-1 flex flex-col p-8">
                
                {/* Tabs */}
                <div className="flex items-center gap-2 bg-ink/5 border border-ink/5 rounded-full p-1.5 w-fit mb-8">
                  <button onClick={() => setTab('input')} className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${tab === 'input' ? 'bg-cream text-ink shadow-sm' : 'text-ink/50 hover:text-ink'}`}>Input</button>
                  <button onClick={() => resultUrl && setTab('output')} disabled={!resultUrl} className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${tab === 'output' ? 'bg-cream text-ink shadow-sm' : 'text-ink/50 hover:text-ink'} disabled:opacity-30 disabled:cursor-not-allowed`}>Output</button>
                </div>

                <AnimatePresence mode="wait">
                  {tab === 'input' ? (
                    <motion.div key="input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }} className="flex-1 flex flex-col">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
                      {!previewUrl ? (
                        <div onClick={handleThumbnailClick}
                          onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={handleDrop}
                          className={`flex-1 min-h-[400px] flex flex-col items-center justify-center gap-6 rounded-3xl cursor-pointer transition-all duration-500 border-2 border-dashed ${isDragging ? 'border-ink bg-ink/5' : 'border-ink/10 hover:border-ink/30 hover:bg-ink/[0.02]'}`}>
                          <div className="w-20 h-20 rounded-full bg-cream border border-ink/10 flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-110">
                            <ImagePlus className="w-8 h-8 text-ink" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-ink">Drop your image here</p>
                            <p className="text-sm font-medium text-ink/50 mt-1">or click to browse from device</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-h-[400px] rounded-3xl bg-cream border border-ink/10 flex items-center justify-center relative shadow-inner overflow-hidden group">
                          <img src={previewUrl} alt="Preview" className="max-w-full max-h-[480px] object-contain rounded-xl p-2" />
                          {fileName && <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl text-xs font-bold text-ink bg-cream/90 backdrop-blur-md border border-ink/10 shadow-lg">{fileName}</div>}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={handleThumbnailClick} className="w-10 h-10 rounded-xl bg-ink text-cream border border-ink/10 flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-lg"><Upload className="w-4 h-4" /></button>
                            <button onClick={resetAll} className="w-10 h-10 rounded-xl bg-[#ffcccc] text-[#cc0000] border border-[#ff9999] flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="output" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }} className="flex-1 flex flex-col h-[480px]">
                      {resultUrl && originalUrl ? (
                        <div className="flex-1 rounded-3xl overflow-hidden border border-ink/10 shadow-lg">
                          <ImageComparisonSlider leftImage={originalUrl} rightImage={resultUrl} altLeft="Original" altRight="Background Removed" />
                        </div>
                      ) : <div className="flex-1 flex items-center justify-center text-ink/40 font-bold text-sm">No result yet</div>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right Area - Controls */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.76, 0, 0.24, 1] }} className="flex flex-col gap-6">
              
              {/* Generate Card */}
              <div className="p-7 rounded-[2rem] bg-ink/[0.02] border border-ink/10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-6">
                <h3 className="text-xs font-bold text-ink/40 uppercase tracking-[0.25em]">Generate</h3>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-[#fff0f0] border border-[#ffcccc] text-xs font-bold text-[#cc0000] flex justify-between items-center shadow-lg">
                    <span className="line-clamp-2">{error}</span>
                    <button onClick={() => setError('')} className="text-[#ff9999] hover:text-[#cc0000] shrink-0 ml-2 p-1">✕</button>
                  </motion.div>
                )}
                
                <button disabled={!previewUrl || !!apiStatus} onClick={runExtraction}
                  className="w-full h-14 rounded-2xl bg-ink text-cream font-bold text-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-ink/20 transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2">
                  {apiStatus ? <><div className="w-4 h-4 border-[3px] border-cream/20 border-t-cream rounded-full animate-spin" />{apiStatus}</>
                  : <><Sparkles className="w-4 h-4" /> Remove Background</>}
                </button>
                <div className="w-full h-px bg-ink/10" />
                <p className="text-xs font-medium text-center text-ink/50 uppercase tracking-widest">— 5 credits cost —</p>
                
                {resultUrl && (
                  <button onClick={resetAll} className="w-full py-3.5 rounded-xl border-2 border-ink/10 font-bold text-ink hover:bg-ink/5 transition-colors duration-300 flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" /> Process new image
                  </button>
                )}
              </div>

              {/* Export Card */}
              {resultUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-7 rounded-[2rem] bg-ink/5 border border-ink/10 shadow-lg space-y-6">
                  <h3 className="text-xs font-bold text-ink/40 uppercase tracking-[0.25em]">Export Result</h3>
                  <DownloadButton resultUrl={resultUrl} />
                </motion.div>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </CinematicIntro>
  );
}
