import React, { useState, useRef } from 'react';

const INR = (n) => '₹' + Number(n).toLocaleString('en-IN');

function Popover({ rows, footer, children }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = () => { clearTimeout(timer.current); setVisible(true); };
  const hide = () => { timer.current = setTimeout(() => setVisible(false), 80); };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          className="absolute z-50 right-0 bottom-full mb-2 w-56
            bg-white border border-slate-200 rounded-xl shadow-xl
            overflow-hidden pointer-events-none"
          style={{ minWidth: '200px' }}
        >
          <div className="px-4 py-3 space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-500">{r.label}</span>
                <span className="text-[11px] font-black text-slate-800">{INR(r.value)}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
              {footer.label}
            </span>
            <span className={`text-xs font-black ${footer.color || 'text-slate-800'}`}>
              {INR(footer.value)}
            </span>
          </div>
        </div>
      )}
    </span>
  );
}

export function RevenueTooltip({ row, children }) {
  return (
    <Popover
      rows={[
        { label: 'Trip Revenue',  value: row.tripRevenue   },
        { label: 'Rental Income', value: row.rentalIncome  },
        { label: 'Other Income',  value: row.otherIncome   },
      ]}
      footer={{ label: 'Total', value: row.revenue, color: 'text-green-700' }}
    >
      {children}
    </Popover>
  );
}

export function ExpensesTooltip({ row, children }) {
  return (
    <Popover
      rows={[
        { label: 'Fuel',              value: row.fuel             },
        { label: 'Maintenance',       value: row.maintenance      },
        { label: 'Tyres',             value: row.tyres            },
        { label: 'Battery',           value: row.battery          },
        { label: 'Driver Settlement', value: row.driverSettlement },
        { label: 'RTA',               value: row.rta              },
        { label: 'Misc',              value: row.misc             },
      ]}
      footer={{ label: 'Total', value: row.expenses, color: 'text-red-600' }}
    >
      {children}
    </Popover>
  );
}

export function ProfitTooltip({ row, children }) {
  return (
    <Popover
      rows={[
        { label: 'Revenue',  value: row.revenue  },
        { label: 'Expenses', value: row.expenses },
      ]}
      footer={{
        label: row.profit >= 0 ? 'Net Profit' : 'Net Loss',
        value: Math.abs(row.profit),
        color: row.profit >= 0 ? 'text-emerald-700' : 'text-red-600',
      }}
    >
      {children}
    </Popover>
  );
}
