import { useState, useEffect, useCallback } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallMode = 'native' | 'ios' | 'firefox' | null;

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function getInstallMode(): InstallMode {
    // Already running as a PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return null;
    if ((navigator as any).standalone === true) return null; // iOS standalone

    const ua = navigator.userAgent;

    // iOS Safari (not Chrome/Firefox on iOS — they don't support PWA install)
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
    if (isIOS && isSafari) return 'ios';

    // Firefox desktop/Android
    if (/Firefox/.test(ua) && !/Seamonkey/.test(ua)) return 'firefox';

    // Chromium-based browsers (Chrome, Edge, Samsung Internet, Opera) → use native prompt
    return 'native';
}

function isDismissed(): boolean {
    try {
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (!dismissed) return false;
        const dismissedAt = parseInt(dismissed, 10);
        if (Date.now() - dismissedAt > DISMISS_DURATION) {
            localStorage.removeItem(DISMISS_KEY);
            return false;
        }
        return true;
    } catch {
        return false;
    }
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [mode, setMode] = useState<InstallMode>(null);
    const [visible, setVisible] = useState(false);
    const [animateOut, setAnimateOut] = useState(false);

    // Listen for the native install prompt (Chromium browsers)
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setMode('native');
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // Determine install mode and show banner after a delay
    useEffect(() => {
        if (isDismissed()) return;

        const timeout = setTimeout(() => {
            const detectedMode = getInstallMode();
            if (detectedMode === 'native' && !deferredPrompt) {
                // Wait for beforeinstallprompt — don't show generic banner for Chromium
                return;
            }
            if (detectedMode) {
                setMode(detectedMode);
                setVisible(true);
            }
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timeout);
    }, [deferredPrompt]);

    // Also show when deferred prompt arrives
    useEffect(() => {
        if (deferredPrompt && !isDismissed()) {
            setVisible(true);
        }
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        setAnimateOut(true);
        setTimeout(() => {
            setVisible(false);
            setAnimateOut(false);
            try {
                localStorage.setItem(DISMISS_KEY, Date.now().toString());
            } catch { /* ignore */ }
        }, 300);
    }, []);

    const handleInstall = useCallback(async () => {
        if (mode === 'native' && deferredPrompt) {
            await deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            if (result.outcome === 'accepted') {
                setVisible(false);
            }
            setDeferredPrompt(null);
        } else {
            // For iOS/Firefox, the button just highlights the instructions — dismiss after tap
            dismiss();
        }
    }, [mode, deferredPrompt, dismiss]);

    if (!visible) return null;

    return (
        <div
            className={`install-prompt-overlay ${animateOut ? 'install-prompt-out' : 'install-prompt-in'}`}
        >
            <div className="install-prompt-banner">
                <button
                    className="install-prompt-close"
                    onClick={dismiss}
                    aria-label="Dismiss install prompt"
                >
                    <X size={18} />
                </button>

                <div className="install-prompt-icon">
                    <img src="/preloader.png" alt="LiveScoreResult" width={48} height={48} />
                </div>

                <div className="install-prompt-content">
                    <h3 className="install-prompt-title">Install LiveScore Result</h3>

                    {mode === 'native' && (
                        <>
                            <p className="install-prompt-desc">
                                Get instant access to live scores right from your home screen — fast, lightweight, no app store needed.
                            </p>
                            <button className="install-prompt-btn" onClick={handleInstall}>
                                <Download size={16} />
                                Install App
                            </button>
                        </>
                    )}

                    {mode === 'ios' && (
                        <>
                            <p className="install-prompt-desc">
                                Add this app to your home screen for the best experience:
                            </p>
                            <div className="install-prompt-steps">
                                <div className="install-step">
                                    <span className="install-step-num">1</span>
                                    <span>Tap the <Share size={14} className="inline-icon" /> <strong>Share</strong> button</span>
                                </div>
                                <div className="install-step">
                                    <span className="install-step-num">2</span>
                                    <span>Scroll down and tap <Plus size={14} className="inline-icon" /> <strong>Add to Home Screen</strong></span>
                                </div>
                            </div>
                        </>
                    )}

                    {mode === 'firefox' && (
                        <>
                            <p className="install-prompt-desc">
                                Install this app for quick access:
                            </p>
                            <div className="install-prompt-steps">
                                <div className="install-step">
                                    <span className="install-step-num">1</span>
                                    <span>Tap the <strong>⋮ menu</strong> (three dots)</span>
                                </div>
                                <div className="install-step">
                                    <span className="install-step-num">2</span>
                                    <span>Tap <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong></span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
