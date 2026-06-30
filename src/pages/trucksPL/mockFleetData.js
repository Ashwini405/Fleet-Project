import { periodDays } from './periodService';

const PLANTS = [
  'Nandyal Cement Works', 'Krishnapatnam Port', 'Vijayawada Thermal',
  'Ramco Cements', 'Jindal Steel', 'Hyderabad Pharma', 'Vizag Steel Plant',
  'Kurnool Solar Farm', 'Guntur Agro Hub', 'Chennai Logistics Park',
];

const MODELS = [
  'Tata Prima 4928.S', 'Ashok Leyland 3518', 'BharatBenz 3523R',
  'Eicher Pro 6031', 'Mahindra Blazo X 35', 'Volvo FH 440',
];

const DRIVERS = [
  'Ravi Kumar', 'Suresh Babu', 'Nagaraju P', 'Venkat Rao', 'Srinivas M',
  'Kiran Reddy', 'Prasad T', 'Anand S', 'Rajesh D', 'Mohan Lal',
  'Bhaskar N', 'Chandra Sekhar', 'Pavan Kumar', 'Srikanth V', 'Mahesh B',
];

const TRUCK_NOS = [
  'TS 42 HI 4882', 'TN 73 KH 7227', 'MH 50 IB 1984', 'KA 62 IN 3957',
  'KA 72 DT 8584', 'KA 35 RK 5014', 'TN 93 CP 1825', 'AP 99 OW 3142',
  'MH 12 RM 2354', 'AP 40 EN 9946', 'TS 71 CF 8495', 'KA 50 TW 9479',
  'AP 17 QA 9301', 'TN 55 AB 1122', 'MH 23 XY 4456', 'AP 33 GH 7890',
  'TS 11 PQ 2233', 'KA 44 RS 5566', 'TN 66 UV 8899', 'AP 77 WX 1234',
  'MH 88 YZ 4567', 'TS 99 BC 7890', 'KA 22 DE 2345', 'TN 33 FG 5678',
  'AP 44 HI 8901', 'MH 55 JK 1234', 'TS 66 LM 4567', 'KA 77 NO 7890',
  'TN 88 PQ 1234', 'AP 55 RS 9876',
];

// Base period = 30 days
const BASE_DAYS = 30;

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
function pick(arr, rng)        { return arr[Math.floor(rng() * arr.length)]; }
function randInt(min, max, rng){ return Math.floor(rng() * (max - min + 1)) + min; }
function scale(val, days)      { return Math.round(val * (days / BASE_DAYS)); }

// Build fleet data for the given period
export function buildFleetData(startDate, endDate) {
  const days = periodDays(startDate, endDate);

  return TRUCK_NOS.map((truckNo, i) => {
    const rng = seededRandom(i * 137 + 42);

    const plant          = pick(PLANTS, rng);
    const driver         = pick(DRIVERS, rng);
    const vehicleModel   = pick(MODELS, rng);

    // Base 30-day values
    const baseTrips          = randInt(8,   28,     rng);
    const baseTripRevenue    = randInt(180000, 650000, rng);
    const baseRentalIncome   = randInt(10000,  60000,  rng);
    const baseOtherIncome    = randInt(2000,   20000,  rng);
    const baseFuel           = randInt(80000,  200000, rng);
    const baseMaintenance    = randInt(8000,   40000,  rng);
    const baseTyres          = randInt(15000,  70000,  rng);
    const baseBattery        = randInt(5000,   25000,  rng);
    const baseDriverSett     = randInt(10000,  35000,  rng);
    const baseRta            = randInt(10000,  50000,  rng);
    const baseMisc           = randInt(3000,   15000,  rng);

    // Scale by period
    const completedTrips   = Math.max(1, scale(baseTrips, days));
    const tripRevenue      = scale(baseTripRevenue,  days);
    const rentalIncome     = scale(baseRentalIncome, days);
    const otherIncome      = scale(baseOtherIncome,  days);
    const revenue          = tripRevenue + rentalIncome + otherIncome;

    const fuel             = scale(baseFuel,        days);
    const maintenance      = scale(baseMaintenance, days);
    const tyres            = scale(baseTyres,       days);
    const battery          = scale(baseBattery,     days);
    const driverSettlement = scale(baseDriverSett,  days);
    const rta              = scale(baseRta,         days);
    const misc             = scale(baseMisc,        days);
    const expenses         = fuel + maintenance + tyres + battery + driverSettlement + rta + misc;

    const profit = revenue - expenses;
    const margin = revenue > 0 ? +((profit / revenue) * 100).toFixed(1) : 0;

    let status;
    if      (margin > 30)  status = 'Excellent';
    else if (margin > 20)  status = 'Good';
    else if (margin > 10)  status = 'Average';
    else if (margin >= 0)  status = 'Low Margin';
    else                   status = 'Loss';

    // lastUpdated = random date within the period
    const rng2 = seededRandom(i * 53 + 7);
    const span = Math.max(0, days - 1);
    const offsetDays = Math.floor(rng2() * (span + 1));
    const lastUpdated = new Date(startDate);
    lastUpdated.setDate(lastUpdated.getDate() + offsetDays);
    lastUpdated.setHours(randInt(8, 20, rng2), randInt(0, 59, rng2));

    return {
      id: i + 1,
      truckNo, plant, driver, vehicleModel, completedTrips,
      tripRevenue, rentalIncome, otherIncome, revenue,
      fuel, maintenance, tyres, battery, driverSettlement, rta, misc,
      expenses, profit, margin, status, lastUpdated,
    };
  });
}
