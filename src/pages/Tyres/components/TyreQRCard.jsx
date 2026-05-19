import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Printer } from 'lucide-react';

export default function TyreQRCard({ tyre }) {
  // Map all possible database fields (tyres, old_tyres, etc.) to a consistent structure
  const mappedTyre = {
    tyreNo: tyre?.tyre_number || tyre?.old_tyre_number || tyre?.tyreNo || tyre?.id || 'UNKNOWN',
    brand: tyre?.brand || tyre?.make || '',
    model: tyre?.model || '',
    vehicleNo: tyre?.vehicle_number || tyre?.vehicleNo || '',
    position: tyre?.tyre_position || tyre?.last_position || tyre?.position || '',
    status: tyre?.status || tyre?.tyre_status || '',
    runningKm: Number(tyre?.running_km || tyre?.runningKm || 0),
  };

  // QR payload – stores real database information, not just a plain ID
  const qrValue = JSON.stringify({
    tyre_number: mappedTyre.tyreNo,
    brand: mappedTyre.brand,
    model: mappedTyre.model,
    vehicle: mappedTyre.vehicleNo,
    position: mappedTyre.position,
    status: mappedTyre.status,
    running_km: mappedTyre.runningKm,
  });

  const qrRef = useRef(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      alert('QR not available');
      return;
    }
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${mappedTyre.tyreNo}.png`;
    a.click();
  };

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) {
      alert('QR not available');
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank', 'width=400,height=500');
    win.document.write(`
      <html>
        <head>
          <title>Tyre QR – ${mappedTyre.tyreNo}</title>
          <style>
            body { margin:0; display:flex; flex-direction:column; align-items:center;
                   justify-content:center; height:100vh; font-family:sans-serif; background:#fff; }
            img  { width:180px; height:180px; }
            p    { margin-top:12px; font-size:14px; font-weight:700; letter-spacing:.05em; color:#1e293b; }
            span { font-size:11px; color:#64748b; margin-top:4px; display:block; }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <img src="${dataUrl}" />
          <p>${mappedTyre.tyreNo}</p>
          <span>${qrValue}</span>
        </body>
      </html>
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

      {/* QR code or empty state */}
      {mappedTyre.tyreNo ? (
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

      {/* Tyre serial */}
      <p className="text-[11px] font-bold text-slate-700 tracking-widest font-mono">
        {mappedTyre.tyreNo}
      </p>

      {/* Status badge */}
      {mappedTyre.status && (
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {mappedTyre.status}
        </p>
      )}

      {/* Vehicle & position info (if available) */}
      {mappedTyre.vehicleNo && (
        <p className="text-[10px] text-slate-500 font-medium">
          {mappedTyre.vehicleNo}
          {mappedTyre.position ? ` • ${mappedTyre.position}` : ''}
        </p>
      )}

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