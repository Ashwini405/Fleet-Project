import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FiArrowLeft, FiPrinter, FiDownload, FiTruck, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';

export function TruckPLHeader({ info, period, reportRef }) {
  const navigate = useNavigate();

  const statusStyle = {
    active: 'bg-green-100 text-green-700 border-green-300',
    inactive: 'bg-red-100 text-red-700 border-red-300',
    maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    breakdown: 'bg-red-100 text-red-700 border-red-300',
    available: 'bg-green-100 text-green-700 border-green-300',
    'on trip': 'bg-blue-100 text-blue-700 border-blue-300',
    'under service': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  // Get status key with fallback
  const statusKey = info?.vehicle_status?.toLowerCase() || 'active';
  const statusClass = statusStyle[statusKey] || statusStyle.active;

  // ── STEP 4: Handle period display ──
  const displayPeriod =
    typeof period === "object" && period !== null
      ? `${period.from || "-"} to ${period.to || "-"}`
      : period || "Current Period";

  const exportPDF = async () => {
    const report = reportRef?.current || document.getElementById('truck-pl-report');
    if (!report) return;

    try {
      const canvas = await html2canvas(report, {
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
          doc.querySelectorAll('*').forEach((el) => {
            const style = el.style;
            ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach((prop) => {
              if (style[prop]?.includes('oklch')) style[prop] = '';
            });
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${info?.vehicle_no || 'truck'}-ProfitLoss.pdf`);
    } catch (error) {
      console.error('Export PDF failed:', error);
      alert('Unable to export PDF. Please try Print or try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Dark top strip */}
      <div className="bg-slate-900 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <FiTruck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-white tracking-widest">{info?.vehicle_no || 'N/A'}</h1>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusClass}`}>
                {info?.vehicle_status || 'Active'}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <FiMapPin className="w-3 h-3" /> {info?.station_name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors"
          >
            <FiPrinter className="w-3.5 h-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <FiDownload className="w-3.5 h-3.5" /> Export PDF
          </button>
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border-t border-slate-100">
        {[
          { icon: FiTruck,    label: 'Vehicle Model', value: info?.make_brand || 'N/A' },
          { icon: FiUser,     label: 'Driver',        value: info?.full_name || 'Unassigned' },
          { icon: FiMapPin,   label: 'Station',       value: info?.station_name || 'N/A' },
          { icon: FiCalendar, label: 'Period',        value: displayPeriod },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}