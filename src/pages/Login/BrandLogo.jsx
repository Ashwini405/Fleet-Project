import React from "react";

// Custom Fleet ERP mark: a truck in motion on a gradient badge.
export function LogoMark({ className = "w-12 h-12" }) {
    return (
        <div className={`relative shrink-0 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-cyan-500 shadow-lg shadow-indigo-900/40 ring-1 ring-white/20 overflow-hidden ${className}`}>
            {/* glossy highlight */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/30 to-transparent" />
            <svg viewBox="0 0 24 24" className="relative w-full h-full p-[18%]" aria-hidden="true">
                {/* speed lines */}
                <g stroke="white" strokeLinecap="round" strokeWidth="1.4">
                    <line x1="1.2" y1="8.5" x2="4.6" y2="8.5" strokeOpacity="0.9" />
                    <line x1="0.4" y1="11.5" x2="4.6" y2="11.5" strokeOpacity="0.65" />
                    <line x1="2" y1="14.5" x2="4.6" y2="14.5" strokeOpacity="0.4" />
                </g>
                {/* trailer */}
                <rect x="6" y="5.5" width="10" height="10" rx="1.6" fill="white" />
                <rect x="7.6" y="7.2" width="6.8" height="1.4" rx="0.7" fill="#6366f1" fillOpacity="0.35" />
                {/* cab */}
                <path d="M16.6 8.6h3.1c.4 0 .8.2 1 .5l2.1 2.8c.1.2.2.4.2.6v2.4c0 .3-.3.6-.6.6h-5.8z" fill="white" fillOpacity="0.92" />
                <path d="M17.8 9.8h1.7l1.4 1.9h-3.1z" fill="#4f46e5" />
                {/* wheels */}
                <circle cx="9.6" cy="16.6" r="2" fill="white" stroke="#4338ca" strokeWidth="1.2" />
                <circle cx="19.4" cy="16.6" r="2" fill="white" stroke="#4338ca" strokeWidth="1.2" />
            </svg>
        </div>
    );
}

// Mark + wordmark. `tone="dark"` for dark backgrounds, "light" for white.
export default function BrandLogo({ tone = "dark" }) {
    const dark = tone === "dark";
    return (
        <div className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-none">
                <p className={`text-[22px] font-black tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                    Fleet
                    <span className={`ml-0.5 bg-clip-text text-transparent bg-linear-to-r ${dark ? "from-indigo-300 to-cyan-300" : "from-indigo-600 to-cyan-500"}`}>
                        ERP
                    </span>
                </p>
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${dark ? "text-indigo-200/70" : "text-slate-400"}`}>
                    Fleet Management Suite
                </p>
            </div>
        </div>
    );
}
