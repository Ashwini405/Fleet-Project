import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScan }) {
  const scannerRef = useRef(null);
  const SCANNER_ID = 'tyre-qr-scanner';

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        scanner.stop().catch(() => {});
        onScan(decodedText);
      },
      () => {} // suppress per-frame errors
    ).catch(() => {});

    return () => {
      scanner.stop().catch(() => {});
    };
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-5 flex flex-col items-center gap-3">
          <div className="w-full rounded-xl overflow-hidden border-2 border-dashed border-blue-200 bg-gray-50">
            <div id={SCANNER_ID} className="w-full" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Scan tyre QR to open tyre details
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
