'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase';
import { useImageUpload } from '@/components/hooks/use-image-upload';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Trash2, RotateCcw, Sparkles, Upload, ArrowLeft } from 'lucide-react';
import { ImageComparisonSlider } from '@/components/ui/image-comparison-slider';
import { DownloadButton } from '@/components/DownloadButton';
import { CreditDisplay } from '@/components/CreditDisplay';
import Link from 'next/link';

import { GradientBackground } from '@/components/ui/gradient-background';
import { LiquidButton } from '@/components/ui/liquid-glass-button';

const ease = [0.16, 1, 0.3, 1] as const;

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
    if (fileObject.size > 4.5 * 1024 * 1024) { setError('Max 4.5MB'); return; }
    setApiStatus('Uploading...'); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please sign in'); setApiStatus(''); return; }
      setApiStatus('Processing...');
      const formData = new FormData(); formData.append('image', fileObject);
      const response = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Authorization': `Bearer ${session.access_token}` }, body: formData });
      if (!response.ok) {
        let errObj: any = {}; try { errObj = await response.json(); } catch (e) {}
        if (response.status === 402) setError('Out of credits.');
        else if (response.status === 504) setError('Server waking up.');
        else if (response.status === 429) setError('Slow down.');
        else setError(errObj.detail || errObj.error || 'Failed.');
        setApiStatus(''); return;
      }
      const data = await response.json();
      if (data.result_url) { setResultUrl(data.result_url); setTab('output'); setTriggerTime(Date.now()); }
      else setError('Failed.');
    } catch (e: any) { setError('Network error'); }
    setApiStatus('');
  };

  return (
    <GradientBackground className="selection:bg-[#C4956A]/30">
      {/* Dark overlay to ensure contrast over the fluid background */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pt-32 pb-20">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[#BFA899] hover:text-white text-sm font-bold transition-colors duration-300 mb-6">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-2">
              <span className="italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#DCA251] via-[#FFF3D6] to-[#AB7B23]">Studio</span>
            </h1>
            <p className="text-xs font-bold text-[#6B5B50] tracking-[0.2em] uppercase mt-4">Upload <span className="mx-1 opacity-50">→</span> Process <span className="mx-1 opacity-50">→</span> Download</p>
          </div>
          <CreditDisplay triggerTime={triggerTime} />
        </motion.div>

        {/* Canvas Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          
          {/* Left Area - Viewer */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease }}
            className="glass3d min-h-[600px] flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col p-8">
              
              {/* Tabs */}
              <div className="flex items-center gap-2 glass3d rounded-full p-1.5 w-fit mb-8 shadow-inner shadow-black/50">
                <button onClick={() => setTab('input')} className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${tab === 'input' ? 'bg-white/10 text-white shadow-md border border-white/10' : 'text-[#BFA899] hover:text-white'}`}>Input</button>
                <button onClick={() => resultUrl && setTab('output')} disabled={!resultUrl} className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${tab === 'output' ? 'bg-white/10 text-white shadow-md border border-white/10' : 'text-[#BFA899] hover:text-white'} disabled:opacity-30 disabled:cursor-not-allowed`}>Output</button>
              </div>

              <AnimatePresence mode="wait">
                {tab === 'input' ? (
                  <motion.div key="input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease }} className="flex-1 flex flex-col">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleFileChange(e); setResultUrl(null); setError(''); }} />
                    {!previewUrl ? (
                      <div onClick={handleThumbnailClick}
                        onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} onDrop={handleDrop}
                        className={`flex-1 min-h-[400px] flex flex-col items-center justify-center gap-6 rounded-3xl cursor-pointer transition-all duration-500 border border-solid shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] ${isDragging ? 'border-[#DCA251] bg-[#DCA251]/5' : 'border-[#BFA899]/20 hover:border-[#DCA251]/40 bg-black/20 hover:bg-black/30'}`}>
                        <div className="w-20 h-20 rounded-full bg-black/40 border border-[#BFA899]/30 flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-110">
                          <ImagePlus className="w-8 h-8 text-[#DCA251]" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">Drop your image here</p>
                          <p className="text-sm font-medium text-[#6B5B50] mt-1">or click to browse from device</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-[400px] rounded-3xl bg-black/30 border border-[#BFA899]/20 flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] overflow-hidden group">
                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-[480px] object-contain rounded-xl p-2 drop-shadow-2xl" />
                        {fileName && <div className="absolute bottom-4 left-4 glass3d px-4 py-2 rounded-xl text-xs font-bold text-white border border-[#BFA899]/20 shadow-xl">{fileName}</div>}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button onClick={handleThumbnailClick} className="w-10 h-10 rounded-xl bg-black/40 border border-[#BFA899]/30 backdrop-blur-md text-white flex items-center justify-center hover:scale-105 hover:bg-black/60 transition-transform duration-300 shadow-lg"><Upload className="w-4 h-4" /></button>
                          <button onClick={resetAll} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-md text-red-500 flex items-center justify-center hover:scale-105 hover:bg-red-500/20 transition-transform duration-300 shadow-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="output" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease }} className="flex-1 flex flex-col h-[480px]">
                    {resultUrl && originalUrl ? (
                      <div className="flex-1 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#BFA899]/20 relative z-10">
                        <ImageComparisonSlider leftImage={originalUrl} rightImage={resultUrl} altLeft="Original" altRight="Background Removed" />
                      </div>
                    ) : <div className="flex-1 flex items-center justify-center text-[#6B5B50] font-bold text-sm">No result yet</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Area - Controls */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }} className="flex flex-col gap-6">
            
            {/* Generate Card */}
            <div className="glass3d p-7 space-y-6">
              <h3 className="text-[10px] font-bold text-[#BFA899] uppercase tracking-[0.3em]">Generate</h3>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 flex justify-between items-center shadow-inner">
                  <span className="line-clamp-2">{error}</span>
                  <button onClick={() => setError('')} className="text-red-400/50 hover:text-red-400 shrink-0 ml-2 p-1">✕</button>
                </motion.div>
              )}
              
              <LiquidButton disabled={!previewUrl || !!apiStatus} onClick={runExtraction} className="w-full h-14">
                {apiStatus ? <><div className="w-4 h-4 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />{apiStatus}</>
                : <><Sparkles className="w-4 h-4" /> Remove Background</>}
              </LiquidButton>

              <div className="w-full h-px bg-[#BFA899]/10" />
              <p className="text-[10px] font-bold text-center text-[#6B5B50] uppercase tracking-[0.2em]">— 5 credits cost —</p>
              
              {resultUrl && (
                <button onClick={resetAll} className="w-full py-3.5 rounded-xl bg-black/20 border border-[#BFA899]/20 font-bold text-[#BFA899] hover:bg-white/5 hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 shadow-inner">
                  <RotateCcw className="w-4 h-4" /> Process new image
                </button>
              )}
            </div>

            {/* Export Card */}
            {resultUrl && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass3d p-7 space-y-6">
                <h3 className="text-[10px] font-bold text-[#BFA899] uppercase tracking-[0.3em]">Export Result</h3>
                <DownloadButton resultUrl={resultUrl} />
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </GradientBackground>
  );
}
