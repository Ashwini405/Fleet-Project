import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Camera, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const SCANNER_ID = 'tyre-qr-scanner';

export default function QRScannerModal({ isOpen, onClose, onTyreFound }) {
  const scannerRef  = useRef(null);
  const scanningRef = useRef(false);
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const stopScanner = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      const state = s.getState?.();
      if (state === 2 || state === 1) await s.stop();
      s.clear();
    } catch (_) {}
    scannerRef.current = null;
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    setStatus('idle');
    setErrMsg('');
    scanningRef.current = false;
    onClose();
  }, [stopScanner, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setStatus('starting');
    setErrMsg('');
    scanningRef.current = false;

    const timer = setTimeout(async () => {
      const el = document.getElementById(SCANNER_ID);
      if (!el) {
        setStatus('error');
        setErrMsg('Scanner element not found. Please close and try again.');
        return;
      }

      // ── decode handler ──────────────────────────────────────────────────
      const onDecode = async (decodedText) => {
        if (scanningRef.current) return;
        scanningRef.current = true;

        await stopScanner();
        setStatus('idle');

        try {
          let tyreNumber;
          try {
            const parsed = JSON.parse(decodedText);
            tyreNumber = parsed.tyre_number;
          } catch {
            tyreNumber = decodedText.trim();
          }

          if (!tyreNumber) { onClose(); return; }

          let foundTyre = null;

          const tyresRes  = await fetch(`${API_URL}/api/tyres`);
          const tyresData = await tyresRes.json();
          if (tyresData.success) {
            foundTyre = tyresData.data.find(
              t => t.tyre_number === tyreNumber || t.serial_no === tyreNumber
            );
          }

          if (!foundTyre) {
            const oldRes  = await fetch(`${API_URL}/api/old-tyres`);
            const oldData = await oldRes.json();
            if (oldData.success) {
              foundTyre = oldData.data.find(
                t => t.old_tyre_number === tyreNumber || t.tyre_number === tyreNumber
              );
            }
          }

          if (foundTyre) onTyreFound?.(foundTyre);
          onClose();
        } catch (err) {
          console.error('QR process error:', err);
          onClose();
        }
      };

      // ── start scanner — rear camera first, fall back to front ───────────
      try {
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        try {
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            onDecode,
            () => {}
          );
        } catch {
          // rear camera failed — try front/any camera
          await scanner.start(
            { facingMode: 'user' },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            onDecode,
            () => {}
          );
        }

        setStatus('scanning');
      } catch (err) {
        console.error('Camera start error:', err);
        const msg = String(err?.message || err || '').toLowerCase();
        if (msg.includes('permission') || msg.includes('notallowed')) {
          setErrMsg('Camera permission denied. Please allow camera access in your browser settings and try again.');
        } else if (msg.includes('notfound') || msg.includes('no camera') || msg.includes('devicenotfound')) {
          setErrMsg('No camera found on this device.');
        } else {
          setErrMsg('Could not start camera. Please ensure camera access is allowed.');
        }
        setStatus('error');
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
      setStatus('idle');
      scanningRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0f172a] text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold tracking-tight">Scan Tyre QR</span>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col items-center gap-3">
          <div className="w-full rounded-xl overflow-hidden border-2 border-dashed border-blue-200 bg-gray-50 min-h-[260px] flex flex-col items-center justify-center relative">

            {/* Scanner mounts video here */}
            <div id={SCANNER_ID} className="w-full" />

            {status === 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-2">
                <Camera className="w-8 h-8 text-blue-400 animate-pulse" />
                <p className="text-xs font-semibold text-slate-500">Starting camera...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-3 px-5 text-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-xs font-semibold text-red-600 leading-relaxed">{errMsg}</p>
              </div>
            )}
          </div>

          {status === 'scanning' && (
            <p className="text-xs text-gray-500 text-center">
              Point camera at tyre QR code to open tyre details
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={handleClose}
            className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
