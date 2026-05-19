import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function QRScannerModal({ isOpen, onClose, onScan, onTyreFound }) {
  const scannerRef = useRef(null);
  const scanningRef = useRef(false);
  const SCANNER_ID = 'tyre-qr-scanner';

  useEffect(() => {
    if (!isOpen) return;

    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        // Prevent duplicate scans
        if (scanningRef.current) return;
        scanningRef.current = true;

        try {
          // Stop scanner immediately
          await scanner.stop().catch(() => {});

          let parsed;
          try {
            parsed = JSON.parse(decodedText);
          } catch {
            alert('Invalid tyre QR – expected JSON data');
            scanningRef.current = false;
            return;
          }

          const tyreNumber = parsed.tyre_number;
          if (!tyreNumber) {
            alert('Invalid QR – missing tyre number');
            scanningRef.current = false;
            return;
          }

          // Fetch active tyres
          const tyresRes = await fetch(`${API_URL}/api/tyres`);
          const tyresData = await tyresRes.json();
          let foundTyre = null;

          if (tyresData.success) {
            foundTyre = tyresData.data.find(
              t => t.tyre_number === tyreNumber || t.old_tyre_number === tyreNumber
            );
          }

          // If not found, search old tyres
          if (!foundTyre) {
            const oldRes = await fetch(`${API_URL}/api/old-tyres`);
            const oldData = await oldRes.json();
            if (oldData.success) {
              foundTyre = oldData.data.find(
                t => t.old_tyre_number === tyreNumber || t.tyre_number === tyreNumber
              );
            }
          }

          if (!foundTyre) {
            alert(`Tyre ${tyreNumber} not found in database`);
            scanningRef.current = false;
            return;
          }

          // Notify parent components
          onScan?.(parsed);
          onTyreFound?.(foundTyre);
          onClose();
        } catch (error) {
          console.error('QR SCAN ERROR:', error);
          alert('Failed to process QR scan');
          scanningRef.current = false;
        }
      },
      () => {} // suppress per-frame errors
    ).catch((err) => {
      console.error('Scanner start error:', err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
          })
          .catch(() => {});
      }
    };
  }, [isOpen, onClose, onScan, onTyreFound]);

  // Function to stop scanner manually (e.g. when closing)
  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }
    onClose();
  };

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
            onClick={handleClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-5 flex flex-col items-center gap-3">
          <div className="w-full rounded-xl overflow-hidden border-2 border-dashed border-blue-200 bg-gray-50">
            <div id={SCANNER_ID} className="w-full" />
            <p className="text-[10px] text-slate-400 font-medium text-center py-2">
              Waiting for QR scan...
            </p>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Scan tyre QR to open tyre details
          </p>
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