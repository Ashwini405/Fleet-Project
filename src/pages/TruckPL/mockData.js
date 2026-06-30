// ─── Master truck registry (matches Reports.jsx DETAILED_FLEET ids) ───────────
export const TRUCK_REGISTRY = {
  1:  { truckNo: 'TS 42 HI 4882', plant: 'Nandyal Cement Works',   model: 'Tata Prima 4028.S',    driver: 'Ravi Kumar',    status: 'Active'   },
  2:  { truckNo: 'TN 73 KH 7227', plant: 'Krishnapatnam Port',     model: 'Ashok Leyland 3518',   driver: 'Suresh Reddy',  status: 'Active'   },
  3:  { truckNo: 'MH 50 IB 1984', plant: 'Krishnapatnam Port',     model: 'BharatBenz 4228R',     driver: 'Mahesh Babu',   status: 'Active'   },
  4:  { truckNo: 'KA 62 IN 3957', plant: 'Krishnapatnam Port',     model: 'Volvo FH16',           driver: 'Arjun Singh',   status: 'Active'   },
  5:  { truckNo: 'KA 72 DT 8584', plant: 'Nandyal Cement Works',   model: 'Eicher Pro 6040',      driver: 'Vikram Yadav',  status: 'Active'   },
  6:  { truckNo: 'KA 35 RK 5014', plant: 'Vijayawada Thermal',     model: 'Tata Signa 4225.T',    driver: 'Naresh Babu',   status: 'Active'   },
  7:  { truckNo: 'TN 93 CP 1825', plant: 'Jindal Steel',           model: 'Mahindra Blazo X 42',  driver: 'Rajesh Kumar',  status: 'Active'   },
  8:  { truckNo: 'AP 99 OW 3142', plant: 'Ramco Cements',          model: 'Tata Prima 5530.S',    driver: 'Srinivas Rao',  status: 'Active'   },
  9:  { truckNo: 'MH 12 RM 2354', plant: 'Vijayawada Thermal',     model: 'Ashok Leyland 4923',   driver: 'Pavan Kumar',   status: 'Review'   },
};

export const PERIOD = 'Oct 2024 – Dec 2024';

// ─── Builder: generates realistic mock P&L data per truck ────────────────────
export function buildTruckPLData(truckId) {
  const info = TRUCK_REGISTRY[truckId] || TRUCK_REGISTRY[1];
  const seed = Number(truckId) * 137;
  const rnd  = (min, max) => Math.round(min + ((seed * 31 + max * 7) % (max - min)));

  // ── Revenue ────────────────────────────────────────────────────────────────
  const revenue = {
    trips: [
      { date: '2024-10-04', route: 'Hyderabad → ' + info.plant, type: 'Freight',      amount: rnd(42000, 68000) },
      { date: '2024-10-18', route: 'Return Load',               type: 'Return Load',   amount: rnd(18000, 32000) },
      { date: '2024-11-02', route: 'Hyderabad → ' + info.plant, type: 'Freight',      amount: rnd(45000, 72000) },
      { date: '2024-11-20', route: 'Return Load',               type: 'Return Load',   amount: rnd(20000, 35000) },
      { date: '2024-12-05', route: 'Hyderabad → ' + info.plant, type: 'Freight',      amount: rnd(48000, 75000) },
      { date: '2024-12-19', route: 'Return Load',               type: 'Return Load',   amount: rnd(22000, 38000) },
    ],
    rental: [
      { date: '2024-11-10', client: 'ABC Constructions', days: 3, amount: rnd(15000, 28000) },
    ],
    other: [
      { date: '2024-10-28', desc: 'Detention Charges', amount: rnd(2000, 5000) },
      { date: '2024-11-15', desc: 'Loading Advance Recovered', amount: rnd(1000, 3000) },
    ],
  };

  // ── Fuel ───────────────────────────────────────────────────────────────────
  const fuel = [
    { date: '2024-10-04', station: 'Indian Oil — NH44',      litres: rnd(180, 240), rate: 92, amount: 0 },
    { date: '2024-10-18', station: 'BPCL Highway Station',   litres: rnd(160, 220), rate: 93, amount: 0 },
    { date: '2024-11-03', station: 'Indian Oil — NH44',      litres: rnd(190, 250), rate: 92, amount: 0 },
    { date: '2024-11-20', station: 'HP Fuel Station',        litres: rnd(170, 230), rate: 93, amount: 0 },
    { date: '2024-12-05', station: 'Indian Oil — NH44',      litres: rnd(185, 245), rate: 94, amount: 0 },
    { date: '2024-12-18', station: 'BPCL Highway Station',   litres: rnd(175, 235), rate: 94, amount: 0 },
  ].map(e => ({ ...e, amount: e.litres * e.rate }));

  // ── Maintenance ────────────────────────────────────────────────────────────
  const maintenance = [
    { date: '2024-10-10', type: 'Oil & Filter Change',        garage: 'City Auto Works',   amount: rnd(2800, 4500)  },
    { date: '2024-11-05', type: 'Brake Pad Replacement',      garage: 'Highway Autocare',  amount: rnd(4500, 8500)  },
    { date: '2024-12-02', type: 'Periodic Service (30K km)',   garage: 'Royal Truck Works', amount: rnd(6500, 11000) },
  ];

  // ── Tyres ──────────────────────────────────────────────────────────────────
  const tyres = [
    { date: '2024-10-15', type: 'Purchase',    desc: 'Apollo 10.00 R20 × 2', amount: rnd(18000, 26000) },
    { date: '2024-11-12', type: 'Retreading',  desc: 'Rear Axle × 2',        amount: rnd(7000, 11000)  },
    { date: '2024-12-08', type: 'Puncture',    desc: 'Front Right — Roadside', amount: rnd(500, 1200)   },
    { date: '2024-12-18', type: 'Replacement', desc: 'Worn Rear Left × 1',   amount: rnd(9000, 13000)  },
  ];

  // ── Battery ────────────────────────────────────────────────────────────────
  const battery = [
    { date: '2024-10-22', type: 'Battery Replacement', desc: 'Amaron 180 Ah × 2',  amount: rnd(14000, 20000) },
    { date: '2024-11-30', type: 'Repair',              desc: 'Terminal Corrosion',  amount: rnd(500, 1500)   },
  ];

  // ── Driver Settlement ──────────────────────────────────────────────────────
  const salaryBase   = rnd(18000, 22000);
  const trips        = revenue.trips.length;
  const batthaRate   = rnd(280, 350);
  const totalBattha  = trips * batthaRate;
  const loading      = rnd(400, 800)  * trips;
  const unloading    = rnd(300, 600)  * trips;
  const bonus        = rnd(0, 3000);
  const allowances   = rnd(1500, 3500);
  const advance      = rnd(8000, 15000);
  const penalty      = rnd(0, 2000);
  const otherDed     = rnd(0, 1000);
  const grossEarnings = salaryBase + totalBattha + loading + unloading + bonus + allowances;
  const totalDeductions = advance + penalty + otherDed;
  const netDriverCost   = grossEarnings - totalDeductions;

  const driverSettlement = {
    salary: salaryBase, trips, batthaRate, totalBattha,
    loading, unloading, bonus, allowances,
    advance, penalty, otherDed,
    grossEarnings, totalDeductions, netDriverCost,
  };

  // ── RTA ────────────────────────────────────────────────────────────────────
  const rta = [
    { date: '2024-10-01', type: 'Road Tax',           amount: rnd(8000, 15000) },
    { date: '2024-10-15', type: 'Permit Renewal',     amount: rnd(5000, 9000)  },
    { date: '2024-11-01', type: 'Insurance Premium',  amount: rnd(12000, 20000)},
    { date: '2024-12-10', type: 'Fitness Certificate', amount: rnd(1500, 3000) },
  ];

  // ── Miscellaneous ──────────────────────────────────────────────────────────
  const misc = [
    { date: '2024-10-10', type: 'Toll',     desc: 'NH-44 Toll Plaza × 6 trips', amount: rnd(3600, 6000) },
    { date: '2024-11-05', type: 'Parking',  desc: 'Yard Parking — 5 nights',    amount: rnd(1000, 2500) },
    { date: '2024-11-18', type: 'Cleaning', desc: 'Full Vehicle Cleaning × 2',  amount: rnd(800, 1500)  },
    { date: '2024-12-12', type: 'Other',    desc: 'Weighbridge Charges',        amount: rnd(600, 1200)  },
  ];

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalTripRevenue   = revenue.trips.reduce((s, r) => s + r.amount, 0);
  const totalRentalRevenue = revenue.rental.reduce((s, r) => s + r.amount, 0);
  const totalOtherRevenue  = revenue.other.reduce((s, r) => s + r.amount, 0);
  const totalRevenue       = totalTripRevenue + totalRentalRevenue + totalOtherRevenue;

  const totalFuel          = fuel.reduce((s, e) => s + e.amount, 0);
  const totalMaint         = maintenance.reduce((s, e) => s + e.amount, 0);
  const totalTyres         = tyres.reduce((s, e) => s + e.amount, 0);
  const totalBattery       = battery.reduce((s, e) => s + e.amount, 0);
  const totalRTA           = rta.reduce((s, e) => s + e.amount, 0);
  const totalMisc          = misc.reduce((s, e) => s + e.amount, 0);
  const totalExpenses      = totalFuel + totalMaint + totalTyres + totalBattery + netDriverCost + totalRTA + totalMisc;
  const netProfit          = totalRevenue - totalExpenses;
  const profitMargin       = totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  const totalLitres        = fuel.reduce((s, e) => s + e.litres, 0);
  const totalDistance      = trips * rnd(420, 680);
  const avgMileage         = totalLitres > 0 ? +(totalDistance / totalLitres).toFixed(2) : 0;
  const fuelPerKm          = totalDistance > 0 ? +(totalFuel / totalDistance).toFixed(2) : 0;
  const revenuePerKm       = totalDistance > 0 ? +(totalRevenue / totalDistance).toFixed(2) : 0;

  // ── Monthly trend (6 months back) ────────────────────────────────────────
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = months.map((month, i) => {
    const rev = rnd(180000, 320000) + i * rnd(5000, 15000);
    const exp = rnd(120000, 220000) + i * rnd(2000, 8000);
    return { month, revenue: rev, expenses: exp, profit: rev - exp };
  });

  // ── Fuel cost trend ───────────────────────────────────────────────────────
  const fuelTrend = months.map((month, i) => ({
    month,
    cost: rnd(55000, 95000) + i * rnd(1000, 4000),
    litres: rnd(600, 1000),
  }));

  // ── Previous-period values (for variance display) ─────────────────────────
  const prev = {
    totalRevenue:  Math.round(totalRevenue  * (0.88 + (seed % 20) / 100)),
    totalFuel:     Math.round(totalFuel     * (0.90 + (seed % 15) / 100)),
    totalMaint:    Math.round(totalMaint    * (0.85 + (seed % 25) / 100)),
    totalTyres:    Math.round(totalTyres    * (0.78 + (seed % 30) / 100)),
    totalBattery:  Math.round(totalBattery  * (0.92 + (seed % 12) / 100)),
    netDriverCost: Math.round(netDriverCost * (0.95 + (seed % 10) / 100)),
    totalRTA:      Math.round(totalRTA      * (0.88 + (seed % 18) / 100)),
    totalMisc:     Math.round(totalMisc     * (0.80 + (seed % 22) / 100)),
  };

  // ── Settlement reference ──────────────────────────────────────────────────
  const settlementRef = `SET-2024-${String(truckId).padStart(3, '0')}`;

  return {
    info, period: PERIOD, truckId,
    revenue,
    fuel, maintenance, tyres, battery, driverSettlement, rta, misc,
    settlementRef,
    prev,
    totals: {
      totalTripRevenue, totalRentalRevenue, totalOtherRevenue, totalRevenue,
      totalFuel, totalMaint, totalTyres, totalBattery, totalRTA, totalMisc,
      netDriverCost, totalExpenses, netProfit, profitMargin,
    },
    kpis: {
      totalRevenue, totalExpenses, netProfit, profitMargin,
      totalTrips: trips, totalDistance, avgMileage, fuelPerKm, revenuePerKm,
    },
    charts: { monthlyTrend, fuelTrend },
  };
}
