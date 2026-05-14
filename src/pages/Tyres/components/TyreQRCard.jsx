import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Printer } from 'lucide-react';

export default function TyreQRCard({ tyreId }) {
  const qrRef   = useRef(null);
  const qrValue = `TYRE-${tyreId}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png');
    a.download = `${qrValue}.png`;
    a.click();
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank', 'width=400,height=500');
    win.document.write(`
      <html><head><title>Tyre QR – ${tyreId}</title>
      <style>
        body { margin:0; display:flex; flex-direction:column; align-items:center;
               justify-content:center; height:100vh; font-family:sans-serif; background:#fff; }
        img  { width:180px; height:180px; }
        p    { margin-top:12px; font-size:14px; font-weight:700; letter-spacing:.05em; color:#1e293b; }
        span { font-size:11px; color:#64748b; margin-top:4px; display:block; }
      </style></head>
      <body onload="window.print();window.close()">
        <img src="${dataUrl}" />
        <p>${tyreId}</p><span>${qrValue}</span>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5 flex flex-col items-center gap-2.5 w-full">

      {/* Header */}
      <div className="flex items-center gap-2 self-start">
        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
          <QrCode className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">QR Identification</span>
      </div>

      {/* QR or empty state */}
      {tyreId ? (
        <div ref={qrRef} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-inner">
          <QRCodeCanvas value={qrValue} size={112} bgColor="#ffffff" fgColor="#0f172a" level="M" />
        </div>
      ) : (
        <div className="w-[158px] h-[158px] rounded-xl border-2 border-dashed border-gray-200
          flex flex-col items-center justify-center gap-1.5 text-gray-400">
          <QrCode className="w-6 h-6 opacity-30" />
          <span className="text-[11px] font-medium">QR not generated</span>
        </div>
      )}

      {/* Serial label */}
      <p className="text-[11px] font-bold text-slate-700 tracking-widest font-mono">{tyreId}</p>

      {/* Action buttons */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownload}
          aria-label="Download QR"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
            bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold
            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        <button
          onClick={handlePrint}
          aria-label="Print QR"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
            border border-gray-200 hover:bg-gray-50 text-gray-700 text-[11px] font-bold
            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm
            focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>
    </div>
  );
}
