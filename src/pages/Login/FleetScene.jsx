import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Isometric "live fleet map" for the login brand panel.
// Everything is drawn in a flat 300×300 ground plane and projected to screen
// space, so roads, buildings and trucks share one consistent 3D perspective.
// ─────────────────────────────────────────────────────────────────────────────

const OX = 260;   // screen x of ground origin (top corner of the platform)
const OY = 34;    // screen y of ground origin
const SIZE = 300; // ground plane size
const DEPTH = 18; // platform thickness

// ground (x, y, height) -> screen [sx, sy]
const iso = (x, y, z = 0) => [0.866 * (x - y) + OX, 0.5 * (x + y) + OY - z];
const pts = (list) => list.map((p) => iso(...p).join(",")).join(" ");
const pathOf = (list) => list.map((p, i) => `${i ? "L" : "M"}${iso(p[0], p[1]).join(" ")}`).join(" ");

// Road grid (centre lines), width in ground units
const ROADS = [60, 150, 240];
const ROAD_W = 12;

// Buildings: [x, y, w, d, h, tint]
const BUILDINGS = [
    [12, 12, 36, 34, 16, "slate"],
    [84, 14, 46, 32, 22, "indigo"],
    [168, 12, 58, 36, 14, "slate"],
    [258, 16, 30, 30, 30, "cyan"],
    [14, 84, 34, 50, 26, "indigo"],
    [84, 88, 50, 48, 12, "slate"],   // depot yard
    [170, 84, 44, 30, 58, "indigo"], // tower
    [258, 90, 30, 44, 18, "slate"],
    [14, 172, 34, 52, 18, "slate"],
    [88, 170, 44, 52, 34, "cyan"],   // warehouse
    [172, 176, 50, 40, 20, "slate"],
    [256, 170, 32, 54, 40, "indigo"],
    [16, 258, 30, 30, 12, "indigo"],
    [86, 258, 50, 30, 24, "slate"],
    [172, 258, 48, 30, 16, "cyan"],
    [258, 258, 30, 30, 26, "slate"],
];

const TINTS = {
    slate:  { top: "#475569", left: "#1e293b", right: "#334155" },
    indigo: { top: "#6366f1", left: "#312e81", right: "#4338ca" },
    cyan:   { top: "#22d3ee", left: "#155e75", right: "#0e7490" },
};

// Highlighted delivery routes (ground coords along road centre lines)
const ROUTES = [
    { pts: [[60, 300], [60, 150], [150, 150], [150, 60], [300, 60]],   color: "#67e8f9", dur: 11 },
    { pts: [[300, 240], [150, 240], [150, 150], [240, 150], [240, 0]], color: "#a5b4fc", dur: 13 },
    { pts: [[0, 240], [60, 240], [60, 60], [240, 60], [240, 150]],     color: "#6ee7b7", dur: 15 },
];

// Location pins on top of buildings: [x, y, h, color]
const PINS = [
    [110, 196, 34, "#67e8f9"],
    [192, 99, 58, "#a5b4fc"],
    [273, 31, 30, "#6ee7b7"],
];

function Box({ x, y, w, d, h, tint }) {
    const c = TINTS[tint];
    return (
        <g>
            {/* right face (+x) */}
            <polygon points={pts([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]])} fill={c.right} />
            {/* left face (+y) */}
            <polygon points={pts([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]])} fill={c.left} />
            {/* roof */}
            <polygon points={pts([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]])} fill={c.top} fillOpacity="0.95" />
            {/* roof highlight edge */}
            <polyline points={pts([[x, y + d, h], [x, y, h], [x + w, y, h]])} fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.8" />
        </g>
    );
}

function Truck({ route, index, animate }) {
    const d = pathOf(route.pts);
    // Without animation, park the truck at the start of its route
    const [sx, sy] = iso(...route.pts[0]);
    return (
        <g transform={animate ? undefined : `translate(${sx} ${sy})`}>
            {/* ground glow */}
            <ellipse rx="11" ry="5.5" fill={route.color} fillOpacity="0.35">
                {animate && <animateMotion dur={`${route.dur}s`} repeatCount="indefinite" path={d} begin={`${-index * 3}s`} />}
            </ellipse>
            {/* truck body: tiny isometric cube */}
            <g>
                <polygon points="0,-9 7,-5.5 0,-2 -7,-5.5" fill="white" />
                <polygon points="-7,-5.5 0,-2 0,3 -7,-0.5" fill={route.color} />
                <polygon points="7,-5.5 0,-2 0,3 7,-0.5" fill={route.color} fillOpacity="0.7" />
                {animate && <animateMotion dur={`${route.dur}s`} repeatCount="indefinite" path={d} begin={`${-index * 3}s`} />}
            </g>
        </g>
    );
}

export default function FleetScene({ animate = true }) {
    const top = iso(0, 0), right = iso(SIZE, 0), bottom = iso(SIZE, SIZE), left = iso(0, SIZE);

    // Painter's order: draw buildings further back first
    const buildings = [...BUILDINGS].sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));

    return (
        <svg viewBox="0 0 520 380" className="w-full h-full" role="img" aria-label="Isometric map of a fleet moving between depots">
            <defs>
                <linearGradient id="fs-ground" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#312e81" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="fs-side-l" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0b1026" />
                </linearGradient>
                <linearGradient id="fs-side-r" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#272268" />
                    <stop offset="100%" stopColor="#101535" />
                </linearGradient>
                <radialGradient id="fs-shadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </radialGradient>
                <filter id="fs-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <style>{`
                    .fs-flow { stroke-dasharray: 5 9; animation: fs-flow 1.1s linear infinite; }
                    @keyframes fs-flow { to { stroke-dashoffset: -28; } }
                    @media (prefers-reduced-motion: reduce) { .fs-flow { animation: none; } }
                `}</style>
            </defs>

            {/* soft floor shadow */}
            <ellipse cx="260" cy="365" rx="230" ry="16" fill="url(#fs-shadow)" />

            {/* platform thickness */}
            <polygon points={`${left} ${bottom} ${bottom[0]},${bottom[1] + DEPTH} ${left[0]},${left[1] + DEPTH}`} fill="url(#fs-side-l)" />
            <polygon points={`${bottom} ${right} ${right[0]},${right[1] + DEPTH} ${bottom[0]},${bottom[1] + DEPTH}`} fill="url(#fs-side-r)" />

            {/* platform top */}
            <polygon points={`${top} ${right} ${bottom} ${left}`} fill="url(#fs-ground)" />
            <polygon points={`${top} ${right} ${bottom} ${left}`} fill="none" stroke="#818cf8" strokeOpacity="0.35" strokeWidth="1" />

            {/* fine ground grid */}
            {Array.from({ length: 11 }, (_, i) => i * 30).map((v) => (
                <g key={v} stroke="#a5b4fc" strokeOpacity="0.07" strokeWidth="0.6">
                    <line x1={iso(v, 0)[0]} y1={iso(v, 0)[1]} x2={iso(v, SIZE)[0]} y2={iso(v, SIZE)[1]} />
                    <line x1={iso(0, v)[0]} y1={iso(0, v)[1]} x2={iso(SIZE, v)[0]} y2={iso(SIZE, v)[1]} />
                </g>
            ))}

            {/* roads */}
            {ROADS.map((c) => (
                <g key={c}>
                    <polygon points={pts([[c - ROAD_W / 2, 0], [c + ROAD_W / 2, 0], [c + ROAD_W / 2, SIZE], [c - ROAD_W / 2, SIZE]])} fill="#0b1020" fillOpacity="0.85" />
                    <polygon points={pts([[0, c - ROAD_W / 2], [SIZE, c - ROAD_W / 2], [SIZE, c + ROAD_W / 2], [0, c + ROAD_W / 2]])} fill="#0b1020" fillOpacity="0.85" />
                </g>
            ))}

            {/* active routes */}
            {ROUTES.map((r, i) => (
                <g key={i}>
                    <path d={pathOf(r.pts)} fill="none" stroke={r.color} strokeOpacity="0.18" strokeWidth="5" strokeLinejoin="round" />
                    <path d={pathOf(r.pts)} fill="none" stroke={r.color} strokeWidth="1.6" strokeLinejoin="round" className={animate ? "fs-flow" : ""} strokeDasharray="5 9" filter="url(#fs-glow)" />
                </g>
            ))}

            {/* trucks (drawn before buildings so taller blocks can occlude them) */}
            {ROUTES.map((r, i) => <Truck key={i} route={r} index={i} animate={animate} />)}

            {/* buildings */}
            {buildings.map(([x, y, w, d, h, tint], i) => (
                <Box key={i} x={x} y={y} w={w} d={d} h={h} tint={tint} />
            ))}

            {/* location pins */}
            {PINS.map(([x, y, h, color], i) => {
                const [sx, sy] = iso(x, y, h);
                return (
                    <g key={i} transform={`translate(${sx} ${sy})`}>
                        <ellipse rx="9" ry="4.5" fill={color} fillOpacity="0.25">
                            {animate && (
                                <>
                                    <animate attributeName="rx" values="4;16;4" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
                                    <animate attributeName="ry" values="2;8;2" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
                                    <animate attributeName="fill-opacity" values="0.45;0;0.45" dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
                                </>
                            )}
                        </ellipse>
                        <line x1="0" y1="0" x2="0" y2="-16" stroke={color} strokeWidth="1.5" />
                        <circle cy="-20" r="5" fill={color} filter="url(#fs-glow)" />
                        <circle cy="-20" r="2" fill="white" />
                    </g>
                );
            })}
        </svg>
    );
}
