const express = require("express");

const router = express.Router();

const RoleController = require("../controllers/roleController");

// ==========================================================
// Dashboard
// ==========================================================

// Dashboard Counts
router.get(
    "/dashboard",
    RoleController.getDashboardCounts
);

// ==========================================================
// Roles
// ==========================================================

// Get All Roles
router.get(
    "/",
    RoleController.getAllRoles
);

// Get Role By ID
router.get(
    "/:id",
    RoleController.getRoleById
);

// Create Role
router.post(
    "/",
    RoleController.createRole
);

// Update Role
router.put(
    "/:id",
    RoleController.updateRole
);

// Delete Role
router.delete(
    "/:id",
    RoleController.deleteRole
);

// Update Role Status
router.patch(
    "/:id/status",
    RoleController.updateRoleStatus
);

// Duplicate Role
router.post(
    "/:id/duplicate",
    RoleController.duplicateRole
);

// ==========================================================
// Role Permissions
// ==========================================================

// Get Role Permissions
router.get(
    "/:id/permissions",
    RoleController.getRolePermissions
);

// Save Role Permissions
router.put(
    "/:id/permissions",
    RoleController.saveRolePermissions
);

// ==========================================================
// Assigned Users
// ==========================================================

// Get Assigned Users
router.get(
    "/:id/users",
    RoleController.getAssignedUsers
);

// ==========================================================
// Audit Logs
// ==========================================================

// Get Role Audit Logs
router.get(
    "/:id/audit-logs",
    RoleController.getRoleAuditLogs
);

module.exports = router;