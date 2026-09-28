import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import {
    Lock, User, Loader2, Eye, EyeOff, AlertCircle, ArrowRight,
    Route, Wrench, IndianRupee, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FleetScene from "./FleetScene";
import BrandLogo from "./BrandLogo";

const FEATURES = [
    { icon: Route,       title: "Vehicles, trips & fuel" },
    { icon: Wrench,      title: "Maintenance & tyres" },
    { icon: IndianRupee, title: "Finance & settlements" },
    { icon: ShieldCheck, title: "Role-based access" },
];

// Dotted backdrop for the brand panel
function DotPattern() {
    return (
        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            <defs>
                <pattern id="login-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="1.5" cy="1.5" r="1.5" fill="white" fillOpacity="0.07" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-dots)" />
        </svg>
    );
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // 3D tilt of the fleet scene following the pointer
    const reduceMotion = useReducedMotion();
    const tiltX = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
    const tiltY = useSpring(useMotionValue(0), { stiffness: 80, damping: 18 });
    const handlePanelMove = (e) => {
        if (reduceMotion) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tiltY.set(px * 14);
        tiltX.set(-py * 10);
    };
    const resetTilt = () => { tiltX.set(0); tiltY.set(0); };

    // location.state.from is set by ProtectedRoute's client-side redirect;
    // ?from= is set by the hard `window.location.href` redirect on refresh-token
    // failure (api.js / patchFetch.js), which can't carry router state.
    const queryFrom = new URLSearchParams(location.search).get("from");
    const from = location.state?.from?.pathname || queryFrom || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username/email and password.");
            return;
        }

        setSubmitting(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            const message = err.response?.data?.message || "Unable to log in. Please try again.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const detectCaps = (e) => setCapsLock(!!e.getModifierState?.("CapsLock"));

    const inputCls =
        "w-full h-12 pl-11 rounded-xl border bg-white text-[15px] text-slate-900 placeholder:text-slate-400 " +
        "transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 " +
        (error ? "border-red-300" : "border-slate-200 hover:border-slate-300");

    return (
        <div className="min-h-screen flex bg-white">

            {/* ── Brand panel (desktop) ───────────────────────────────── */}
            <div
                onMouseMove={handlePanelMove}
                onMouseLeave={resetTilt}
                className="hidden lg:flex relative w-1/2 overflow-hidden bg-linear-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white"
            >
                <DotPattern />
                <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-indigo-500/30 blur-3xl" />
                <div className="absolute -bottom-40 -right-24 w-md h-112 rounded-full bg-cyan-400/20 blur-3xl" />

                <div className="relative z-10 flex flex-col w-full h-screen px-12 py-10 xl:px-16">
                    {/* Logo */}
                    <div className="shrink-0">
                        <BrandLogo tone="dark" />
                    </div>

                    {/* Headline */}
                    <div className="mt-8 xl:mt-10 shrink-0 max-w-xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl xl:text-[2.75rem] font-black leading-[1.1] tracking-tight"
                        >
                            Run your entire fleet
                            <span className="block bg-linear-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                                from one place.
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mt-4 text-[15px] text-indigo-100/75 leading-relaxed"
                        >
                            Operations, maintenance, finance and staff, connected in a single workspace built for logistics teams.
                        </motion.p>
                    </div>

                    {/* 3D fleet scene */}
                    <div className="relative flex-1 min-h-0 flex items-center justify-center my-4" style={{ perspective: 1200 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
                            style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}
                            className="relative w-full max-w-140 h-full max-h-105"
                        >
                            <motion.div
                                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                className="w-full h-full drop-shadow-2xl"
                            >
                                <FleetScene animate={!reduceMotion} />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Feature pills */}
                    <div className="shrink-0 flex flex-wrap gap-2">
                        {FEATURES.map((f, i) => (
                            <motion.span
                                key={f.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
                                className="inline-flex items-center gap-2 rounded-full bg-white/7 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-50"
                            >
                                <f.icon className="w-3.5 h-3.5 text-indigo-200" />
                                {f.title}
                            </motion.span>
                        ))}
                    </div>

                    <p className="shrink-0 mt-5 text-xs text-indigo-200/60">© {new Date().getFullYear()} Fleet ERP. All rights reserved.</p>
                </div>
            </div>

            {/* ── Form panel ───────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 bg-slate-50 lg:bg-white relative">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-10">
                        <BrandLogo tone="light" />
                    </div>

                    <div className="bg-white lg:bg-transparent rounded-3xl lg:rounded-none shadow-xl shadow-slate-200/60 lg:shadow-none border border-slate-100 lg:border-0 p-7 sm:p-9 lg:p-0">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h1>
                        <p className="mt-2 text-[15px] text-slate-500">Sign in to continue to your fleet workspace.</p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                            <div>
                                <label htmlFor="login-username" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Username or Email
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                                    <input
                                        id="login-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => { setUsername(e.target.value); setError(""); }}
                                        autoComplete="username"
                                        autoFocus
                                        className={`${inputCls} pr-4`}
                                        placeholder="Enter your username or email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        onKeyUp={detectCaps}
                                        onKeyDown={detectCaps}
                                        onBlur={() => setCapsLock(false)}
                                        autoComplete="current-password"
                                        className={`${inputCls} pr-12`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                    </button>
                                </div>
                                {capsLock && (
                                    <p className="mt-2 text-xs font-semibold text-amber-600">Caps Lock is on</p>
                                )}
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    role="alert"
                                    className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                                >
                                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-px" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="group w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 text-white text-[15px] font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:from-indigo-500 hover:to-indigo-700 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Access is managed by your administrator. Contact them if you can't sign in.</span>
                        </div>
                    </div>

                    <p className="lg:hidden mt-8 text-center text-xs text-slate-400">
                        © {new Date().getFullYear()} Fleet ERP. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
