import React from 'react';
import { Layers, Circle, GitFork, LayoutGrid, Archive, Ruler } from 'lucide-react';
import { axleLayouts } from '../data/axleLayouts';

const CARDS = [
  {
    key:   'wheelConfiguration',
    label: 'Wheel Type',
    icon:  Circle,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    get:   (truck) => truck.wheelConfiguration || '—',
  },
  {
    key:   'totalTyres',
    label: 'Total Tyres',
    icon:  Layers,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    get:   (truck, layout) => layout?.totalTyres ?? truck.totalTyres ?? '—',
  },
  {
    key:   'axleCount',
    label: 'Axle Count',
    icon:  GitFork,
    color: 'text-violet-600 bg-violet-50 border-violet-100',
    get:   (truck, layout) => layout?.axleCount ?? '—',
  },
  {
    key:   'layoutType',
    label: 'Layout Type',
    icon:  LayoutGrid,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    get:   (truck, layout) => layout?.layoutType ?? '—',
  },
  {
    key:   'spareTyres',
    label: 'Spare Tyres',
    icon:  Archive,
    color: 'text-orange-600 bg-orange-50 border-orange-100',
    get:   (truck) => truck.spareTyres ?? '—',
  },
  {
    key:   'tyreSize',
    label: 'Tyre Size',
    icon:  Ruler,
    color: 'text-slate-600 bg-slate-50 border-slate-200',
    get:   (truck) => truck.tyreSize || '—',
  },
];

/**
 * TyreConfigCards
 * @param {object} truckData  — truck record (id, wheelConfiguration, totalTyres, spareTyres, tyreSize …)
 * @param {string} [className] — extra wrapper classes
 * @param {'sm'|'md'} [size]  — 'sm' for compact (inside modal header), 'md' for full (tab view)
 */
export default function TyreConfigCards({ truckData, className = '', size = 'md' }) {
  if (!truckData) return null;
  const layout = axleLayouts[truckData.wheelConfiguration];

  const isSm = size === 'sm';

  return (
    <div className={`grid grid-cols-3 sm:grid-cols-6 gap-2 ${className}`}>
      {CARDS.map(({ key, label, icon: Icon, color, get }) => {
        const value = get(truckData, layout);
        return (
          <div
            key={key}
            className={`flex flex-col items-center justify-center rounded-xl border text-center
              ${color}
              ${isSm ? 'px-2 py-1.5 gap-0.5' : 'px-3 py-2.5 gap-1'}`}
          >
            <Icon className={isSm ? 'w-3 h-3 opacity-70' : 'w-3.5 h-3.5 opacity-80'} />
            <span className={`font-black leading-none ${isSm ? 'text-[11px]' : 'text-sm'}`}>
              {value}
            </span>
            <span className={`font-semibold uppercase tracking-wider text-current opacity-60 leading-none
              ${isSm ? 'text-[7px]' : 'text-[8px]'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
