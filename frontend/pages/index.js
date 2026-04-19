/**
 * Background Removal AI — Main Page
 * ===================================
 * 
 * Premium UI with:
 *   - Drag & drop / click to upload
 *   - Real-time processing animation
 *   - Before/After comparison slider
 *   - Download result as transparent PNG
 *   - Auth state management (sign in/out)
 *   - Credit display
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import {
  supabase,
  getSession,
  getAccessToken,
  signInWithGoogle,
  signInWithEmail,
  signOut,
  getUserCredits,
} from '../lib/supabase';

export default function Home() {
  // ── State ──
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [inferenceTime, setInferenceTime] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  const fileInputRef = useRef(null);
  const sliderRef = useRef(null);

  // ── Auth Listener ──
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const creds = await getUserCredits();
        setCredits(creds);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const creds = await getUserCredits();
          setCredits(creds);
        } else {
          setCredits(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── File Upload Handler ──
  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Image must be under 20MB.');
      return;
    }

    setError(null);
    setResultUrl(null);
    setInferenceTime(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }, []);

  // ── Drag & Drop ──
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // ── Process Image ──
  const processImage = async () => {
    if (!file) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (credits && credits.credits_left <= 0) {
      setError('No credits remaining. Upgrade your plan.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Processing failed (${response.status})`);
      }

      // Read inference time from header
      const infTime = response.headers.get('X-Inference-Time');
      if (infTime) setInferenceTime(infTime);

      // Update credits
      const creditsLeft = response.headers.get('X-Credits-Remaining');
      if (creditsLeft) {
        setCredits(prev => ({...prev, credits_left: parseInt(creditsLeft)}));
      }

      // Create blob URL for result
      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));

    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Download Result ──
  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file?.name?.replace(/\.[^.]+$/, '') || 'image'}_nobg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ── Auth Handlers ──
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
    setAuthLoading(false);
  };

  const handleEmailSignIn = async () => {
    if (!email) return;
    setAuthLoading(true);
    try {
      await signInWithEmail(email);
      setError(null);
      alert('Check your email for the login link!');
    } catch (err) {
      setError(err.message);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setCredits(null);
  };

  // ── Comparison Slider ──
  const handleSliderMove = useCallback((e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  // ── Render ──
  return (
    <>
      <Head>
        <title>Background Removal AI | Remove Image Backgrounds Instantly</title>
        <meta name="description" content="Remove image backgrounds instantly with our custom-trained AI. No signup required for your first 5 images. Powered by a MobileNetV3 neural network." />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✂️</text></svg>" />
      </Head>

      <div style={styles.page}>
        {/* ── Background Effects ── */}
        <div style={styles.bgGlow} />
        <div style={styles.bgGrid} />

        {/* ── Header ── */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>✂️</span>
              <span style={styles.logoText}>BG Remover</span>
              <span style={styles.badge}>AI</span>
            </div>

            <div style={styles.headerRight}>
              {credits && (
                <div style={styles.creditBadge}>
                  <span style={styles.creditIcon}>⚡</span>
                  <span>{credits.credits_left} credits</span>
                </div>
              )}

              {user ? (
                <div style={styles.userArea}>
                  <span style={styles.userEmail}>{user.email}</span>
                  <button onClick={handleSignOut} style={styles.signOutBtn}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} style={styles.signInBtn}>
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <main style={styles.main}>
          <div style={styles.heroText}>
            <h1 style={styles.h1}>
              Remove Backgrounds
              <br />
              <span style={styles.gradient}>In One Click</span>
            </h1>
            <p style={styles.subtitle}>
              Custom-trained MobileNetV3 neural network. No GPU required.
              <br />
              Upload your image and get a transparent PNG in seconds.
            </p>
          </div>

          {/* ── Upload Area ── */}
          {!previewUrl && (
            <div
              style={{
                ...styles.dropzone,
                ...(dragActive ? styles.dropzoneActive : {}),
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="upload-dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div style={styles.dropzoneInner}>
                <div style={styles.uploadIcon}>
                  {dragActive ? '📥' : '🖼️'}
                </div>
                <p style={styles.dropzoneTitle}>
                  {dragActive ? 'Drop your image here' : 'Drop image or click to upload'}
                </p>
                <p style={styles.dropzoneHint}>JPEG, PNG, or WebP up to 20MB</p>
              </div>
            </div>
          )}

          {/* ── Preview / Result ── */}
          {previewUrl && (
            <div style={styles.previewSection}>
              {/* Before/After Comparison */}
              {resultUrl ? (
                <div
                  ref={sliderRef}
                  style={styles.comparisonContainer}
                  onMouseMove={handleSliderMove}
                  onTouchMove={handleSliderMove}
                >
                  {/* After (result — full width) */}
                  <div style={styles.comparisonLayer}>
                    <img src={resultUrl} alt="Result" style={styles.comparisonImg} />
                    <div style={styles.comparisonLabel}>After</div>
                  </div>

                  {/* Before (original — clipped) */}
                  <div style={{
                    ...styles.comparisonLayer,
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}>
                    <img src={previewUrl} alt="Original" style={styles.comparisonImg} />
                    <div style={styles.comparisonLabel}>Before</div>
                  </div>

                  {/* Slider line */}
                  <div style={{
                    ...styles.sliderLine,
                    left: `${sliderPos}%`,
                  }}>
                    <div style={styles.sliderHandle}>⟨ ⟩</div>
                  </div>
                </div>
              ) : (
                <div style={styles.singlePreview}>
                  <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                  {processing && (
                    <div style={styles.processingOverlay}>
                      <div style={styles.spinner} />
                      <p style={styles.processingText}>Removing background...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={styles.actions}>
                {!resultUrl ? (
                  <>
                    <button
                      onClick={processImage}
                      disabled={processing}
                      style={{
                        ...styles.primaryBtn,
                        ...(processing ? styles.primaryBtnDisabled : {}),
                      }}
                      id="process-button"
                    >
                      {processing ? 'Processing...' : '✂️ Remove Background'}
                    </button>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setError(null);
                      }}
                      style={styles.secondaryBtn}
                    >
                      Change Image
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={downloadResult} style={styles.primaryBtn} id="download-button">
                      ⬇️ Download PNG
                    </button>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setResultUrl(null);
                        setInferenceTime(null);
                      }}
                      style={styles.secondaryBtn}
                    >
                      Process Another
                    </button>
                  </>
                )}
              </div>

              {/* Inference time */}
              {inferenceTime && (
                <p style={styles.inferenceTime}>
                  Processed in {inferenceTime}
                </p>
              )}
            </div>
          )}

          {/* ── Error Message ── */}
          {error && (
            <div style={styles.errorBox}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* ── Features ── */}
          <div style={styles.features}>
            {[
              { icon: '🧠', title: 'Custom AI', desc: 'Trained from scratch — no API dependency' },
              { icon: '⚡', title: 'Fast CPU', desc: 'INT8 quantized ONNX — <300ms inference' },
              { icon: '🔒', title: 'Secure', desc: 'HMAC signatures, rate limiting, audit logs' },
              { icon: '🎨', title: 'Clean Edges', desc: 'Guided filter matting for hair-level detail' },
            ].map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* ── Auth Modal ── */}
        {showAuth && !user && (
          <div style={styles.modalBackdrop} onClick={() => setShowAuth(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Sign In</h2>
              <p style={styles.modalSubtitle}>Get 5 free credits to start</p>

              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                style={styles.googleBtn}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" style={{marginRight: 8}}>
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9.003 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"/>
                </svg>
                Continue with Google
              </button>

              <div style={styles.divider}>
                <span style={styles.dividerText}>or</span>
              </div>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSignIn()}
                style={styles.emailInput}
              />
              <button
                onClick={handleEmailSignIn}
                disabled={authLoading || !email}
                style={styles.emailBtn}
              >
                Send Magic Link
              </button>

              <button onClick={() => setShowAuth(false)} style={styles.modalClose}>
                &times;
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer style={styles.footer}>
          <p>Built from scratch with MobileNetV3 + CBAM Attention</p>
          <p style={{ opacity: 0.5, fontSize: 12 }}>
            No pretrained weights. No external APIs.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: #0a0a0f;
          color: #e0e0e0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}


// ─────────────────────────────────────────────────────────────────
// Styles (Inline CSS-in-JS — premium dark theme)
// ─────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'fixed',
    top: '-40%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '64px 64px',
    pointerEvents: 'none',
    zIndex: 0,
  },

  // Header
  header: {
    position: 'relative',
    zIndex: 10,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    background: 'rgba(10, 10, 15, 0.8)',
  },
  headerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 4,
    letterSpacing: 1,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  creditBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 12px',
    borderRadius: 20,
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    fontSize: 13,
    fontWeight: 500,
    color: '#a5b4fc',
  },
  creditIcon: { fontSize: 14 },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    fontSize: 13,
    color: '#a0a0a0',
  },
  signOutBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#a0a0a0',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  signInBtn: {
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Main
  main: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 900,
    margin: '0 auto',
    padding: '60px 24px 40px',
  },
  heroText: {
    textAlign: 'center',
    marginBottom: 48,
    animation: 'fadeIn 0.6s ease-out',
  },
  h1: {
    fontSize: 'clamp(32px, 5vw, 56px)',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#fff',
    marginBottom: 16,
    letterSpacing: '-0.02em',
  },
  gradient: {
    background: 'linear-gradient(135deg, #6366f1, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 1.6,
  },

  // Dropzone
  dropzone: {
    border: '2px dashed rgba(99, 102, 241, 0.3)',
    borderRadius: 16,
    padding: '64px 32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(99, 102, 241, 0.03)',
    animation: 'fadeIn 0.6s ease-out 0.2s both',
  },
  dropzoneActive: {
    border: '2px dashed #6366f1',
    background: 'rgba(99, 102, 241, 0.08)',
    transform: 'scale(1.01)',
  },
  dropzoneInner: {},
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  dropzoneTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#d0d0d0',
    marginBottom: 8,
  },
  dropzoneHint: {
    fontSize: 13,
    color: '#666',
  },

  // Preview
  previewSection: {
    animation: 'fadeIn 0.4s ease-out',
  },
  singlePreview: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#111',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  previewImg: {
    width: '100%',
    height: 'auto',
    maxHeight: 500,
    objectFit: 'contain',
    display: 'block',
  },
  processingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '3px solid rgba(99, 102, 241, 0.2)',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: 16,
  },
  processingText: {
    fontSize: 14,
    color: '#a5b4fc',
    animation: 'pulse 2s ease-in-out infinite',
  },

  // Comparison slider
  comparisonContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    cursor: 'col-resize',
    background: `
      repeating-conic-gradient(#1a1a2e 0% 25%, #12121f 0% 50%) 
      50% / 20px 20px
    `,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  comparisonLayer: {
    position: 'relative',
    width: '100%',
  },
  comparisonImg: {
    width: '100%',
    height: 'auto',
    maxHeight: 500,
    objectFit: 'contain',
    display: 'block',
  },
  comparisonLabel: {
    position: 'absolute',
    top: 12,
    padding: '4px 12px',
    borderRadius: 6,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    left: 12,
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    background: '#6366f1',
    transform: 'translateX(-50%)',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderHandle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#6366f1',
    border: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    color: '#fff',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },

  // Buttons
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryBtn: {
    padding: '14px 32px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
  },
  primaryBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  secondaryBtn: {
    padding: '14px 24px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  inferenceTime: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    color: '#666',
  },

  // Error
  errorBox: {
    marginTop: 20,
    padding: '12px 20px',
    borderRadius: 10,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
  },

  // Features
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginTop: 64,
    animation: 'fadeIn 0.6s ease-out 0.4s both',
  },
  featureCard: {
    padding: '24px 20px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  featureIcon: { fontSize: 28, marginBottom: 12, display: 'block' },
  featureTitle: { fontSize: 14, fontWeight: 700, color: '#e0e0e0', marginBottom: 4 },
  featureDesc: { fontSize: 12, color: '#777', lineHeight: 1.4 },

  // Auth Modal
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    position: 'relative',
    width: 380,
    maxWidth: '90vw',
    padding: '40px 32px',
    borderRadius: 20,
    background: '#16161f',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.3s ease-out',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 28,
  },
  googleBtn: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    gap: 12,
  },
  dividerText: {
    fontSize: 12,
    color: '#555',
    flex: '0 0 auto',
  },
  emailInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: '#e0e0e0',
    fontSize: 14,
    outline: 'none',
    marginBottom: 12,
    transition: 'border 0.2s',
  },
  emailBtn: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 16,
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: 24,
    cursor: 'pointer',
    lineHeight: 1,
  },

  // Footer
  footer: {
    textAlign: 'center',
    padding: '32px 24px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    fontSize: 13,
    color: '#555',
    position: 'relative',
    zIndex: 1,
  },
};
