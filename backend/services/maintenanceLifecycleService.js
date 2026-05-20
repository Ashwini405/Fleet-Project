const db = require('../config/db');

const ACTIVE_REPAIR_STATUSES = ['Reported', 'Under Repair', 'In Progress'];
const UNRESOLVED_DEFECT_STATUSES = ['Open', 'In Progress'];

const normalizeText = (value) => (value || '').toString().toLowerCase();

const isCriticalDefect = (defect) => {
  const text = normalizeText(`${defect.severity} ${defect.priority} ${defect.issue_type} ${defect.description}`);
  return text.includes('critical') || text.includes('failed') || text.includes('tyre') || text.includes('tire');
};

const getRecommendationForIssue = (issue) => {
  const text = normalizeText(issue);
  if (/(tyre|tire|wheel|tread|puncture|pressure)/.test(text)) return 'Tyre Replacement';
  if (/brake/.test(text)) return 'Brake Service';
  if (/(oil|engine|coolant|leak)/.test(text)) return 'Oil Change';
  return 'Periodic Service';
};

const getHealthLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 45) return 'Warning';
  return 'Critical';
};

async function setVehicleStatusForLifecycle(vehicleId) {
  if (!vehicleId) return;

  const [blockingDefects] = await db.query(
    `
      SELECT id, severity, priority, issue_type, description
      FROM inspection_defects
      WHERE vehicle_id = ?
        AND status IN ('Open', 'In Progress')
    `,
    [vehicleId]
  );

  const [activeRepairs] = await db.query(
    `
      SELECT id
      FROM repair_services
      WHERE vehicle_id = ?
        AND status IN ('Reported', 'Under Repair', 'In Progress')
      LIMIT 1
    `,
    [vehicleId]
  );

  const hasCriticalDefect = blockingDefects.some(isCriticalDefect);
  const status = hasCriticalDefect || activeRepairs.length > 0 ? 'under_repair' : 'Active';

  await db.query('UPDATE vehicles SET vehicle_status = ? WHERE id = ?', [status, vehicleId]);
}

async function markDefectInProgress(defectId, repairId = null) {
  if (!defectId) return;
  const payload = { status: 'In Progress' };
  if (repairId) payload.created_repair_id = repairId;
  await db.query('UPDATE inspection_defects SET ? WHERE id = ?', [payload, defectId]);
}

async function markDefectResolved(defectId, repairId = null) {
  if (!defectId) return;
  const payload = {
    status: 'Resolved',
    resolved_at: new Date(),
  };
  if (repairId) payload.created_repair_id = repairId;
  await db.query('UPDATE inspection_defects SET ? WHERE id = ?', [payload, defectId]);
}

async function syncRepairLifecycle(repair) {
  if (!repair?.inspection_defect_id) {
    if (repair?.vehicle_id) await setVehicleStatusForLifecycle(repair.vehicle_id);
    return;
  }

  if (repair.status === 'Completed') {
    await markDefectResolved(repair.inspection_defect_id, repair.id);
  } else {
    await markDefectInProgress(repair.inspection_defect_id, repair.id);
  }

  if (repair.vehicle_id) await setVehicleStatusForLifecycle(repair.vehicle_id);
}

async function getVehicleHealth(vehicleId) {
  const [[vehicle]] = await db.query('SELECT id, vehicle_no FROM vehicles WHERE id = ?', [vehicleId]);
  if (!vehicle) return null;

  const [[defectStats]] = await db.query(
    `
      SELECT
        SUM(status IN ('Open', 'In Progress')) AS unresolved_count,
        SUM(status IN ('Open', 'In Progress') AND (severity IN ('Critical', 'Failed') OR priority = 'High')) AS critical_count,
        SUM(status IN ('Open', 'In Progress') AND (issue_type LIKE '%tyre%' OR issue_type LIKE '%tire%' OR description LIKE '%tyre%' OR description LIKE '%tire%')) AS tyre_count
      FROM inspection_defects
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );

  const [[repairStats]] = await db.query(
    `
      SELECT
        SUM(status IN ('Reported', 'Under Repair', 'In Progress')) AS pending_repairs,
        SUM(status = 'Completed') AS completed_repairs
      FROM repair_services
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );

  const [[serviceStats]] = await db.query(
    `
      SELECT
        SUM(next_due IS NOT NULL AND odometer IS NOT NULL AND next_due <= odometer AND status != 'Completed') AS overdue_services,
        COUNT(*) AS total_services
      FROM vehicle_services
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );

  let score = 100;
  score -= Math.min(35, Number(defectStats?.critical_count || 0) * 20);
  score -= Math.min(30, Number(defectStats?.tyre_count || 0) * 18);
  score -= Math.min(25, Number(repairStats?.pending_repairs || 0) * 10);
  score -= Math.min(20, Number(serviceStats?.overdue_services || 0) * 10);
  score -= Math.min(15, Math.max(0, Number(defectStats?.unresolved_count || 0) - Number(defectStats?.critical_count || 0)) * 5);
  score = Math.max(0, Math.round(score));

  return {
    vehicle_id: vehicle.id,
    vehicle_no: vehicle.vehicle_no,
    score,
    label: getHealthLabel(score),
    defectStats: {
      unresolved: Number(defectStats?.unresolved_count || 0),
      critical: Number(defectStats?.critical_count || 0),
      critical_tyre: Number(defectStats?.tyre_count || 0),
    },
    repairStats: {
      pending_repairs: Number(repairStats?.pending_repairs || 0),
      completed_repairs: Number(repairStats?.completed_repairs || 0),
    },
    serviceStats: {
      overdue_services: Number(serviceStats?.overdue_services || 0),
      total_services: Number(serviceStats?.total_services || 0),
    },
  };
}

async function getDashboardAlerts() {
  const [[failedInspections]] = await db.query(
    "SELECT COUNT(*) AS count FROM inspections WHERE inspection_status = 'Failed'"
  );
  const [[pendingRepairs]] = await db.query(
    "SELECT COUNT(*) AS count FROM repair_services WHERE status IN ('Reported', 'Under Repair', 'In Progress')"
  );
  const [[vehiclesUnderRepair]] = await db.query(
    "SELECT COUNT(*) AS count FROM vehicles WHERE vehicle_status = 'under_repair'"
  );
  const [[criticalTyreIssues]] = await db.query(
    `
      SELECT COUNT(*) AS count
      FROM inspection_defects
      WHERE status IN ('Open', 'In Progress')
        AND (issue_type LIKE '%tyre%' OR issue_type LIKE '%tire%' OR description LIKE '%tyre%' OR description LIKE '%tire%' OR severity IN ('Critical', 'Failed'))
    `
  );
  const [[overdueServices]] = await db.query(
    `
      SELECT COUNT(*) AS count
      FROM vehicle_services
      WHERE next_due IS NOT NULL
        AND odometer IS NOT NULL
        AND next_due <= odometer
        AND status != 'Completed'
    `
  );

  return {
    vehicles_failed_inspection: Number(failedInspections?.count || 0),
    pending_repairs: Number(pendingRepairs?.count || 0),
    vehicles_under_repair: Number(vehiclesUnderRepair?.count || 0),
    critical_tyre_issues: Number(criticalTyreIssues?.count || 0),
    overdue_services: Number(overdueServices?.count || 0),
  };
}

async function getVehicleTimeline(vehicleId) {
  const [inspections] = await db.query(
    `
      SELECT inspection_date AS event_time, inspection_number AS title, inspection_status AS status,
             inspection_number AS reference_id, final_notes AS description
      FROM inspections
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );
  const [defects] = await db.query(
    `
      SELECT created_at AS event_time, issue_type AS title, status,
             CAST(id AS CHAR) AS reference_id, description
      FROM inspection_defects
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );
  const [repairs] = await db.query(
    `
      SELECT COALESCE(completed_date, service_date, created_at) AS event_time, issue_description AS title, status,
             CONCAT('REP-', id) AS reference_id, repair_notes AS description
      FROM repair_services
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );
  const [services] = await db.query(
    `
      SELECT COALESCE(completed_date, service_date, created_at) AS event_time, service_type AS title, status,
             CAST(id AS CHAR) AS reference_id, work_description AS description
      FROM vehicle_services
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );
  const [tyres] = await db.query(
    `
      SELECT service_date AS event_time, COALESCE(action_taken, issue_type) AS title, tyre_health AS status,
             CAST(id AS CHAR) AS reference_id, CONCAT(IFNULL(tyre_number, ''), ' ', IFNULL(axle_position, '')) AS description
      FROM tyre_service_history
      WHERE vehicle_id = ?
    `,
    [vehicleId]
  );

  return [
    ...inspections.map(row => ({ ...row, event_type: 'Inspection' })),
    ...defects.map(row => ({ ...row, event_type: 'Inspection Defect' })),
    ...repairs.map(row => ({ ...row, event_type: 'Repair' })),
    ...services.map(row => ({ ...row, event_type: 'Periodic Service' })),
    ...tyres.map(row => ({ ...row, event_type: 'Tyre Change' })),
  ]
    .filter(row => row.event_time)
    .sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
    .slice(0, 80);
}

function buildRecommendationsFromItems(items) {
  const recommendations = new Set();
  items.forEach((item) => {
    const text = `${item.item_name || ''} ${item.name || ''} ${item.desc || ''} ${item.description || ''} ${item.issue_type || ''}`;
    recommendations.add(getRecommendationForIssue(text));
  });
  return Array.from(recommendations);
}

module.exports = {
  ACTIVE_REPAIR_STATUSES,
  UNRESOLVED_DEFECT_STATUSES,
  buildRecommendationsFromItems,
  getDashboardAlerts,
  getVehicleHealth,
  getVehicleTimeline,
  isCriticalDefect,
  markDefectInProgress,
  markDefectResolved,
  setVehicleStatusForLifecycle,
  syncRepairLifecycle,
};
