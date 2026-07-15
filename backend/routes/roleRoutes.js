const express = require("express");

const router = express.Router();

const RoleController = require("../controllers/roleController");
const { protect } = require("../middleware/permissionMiddleware");

// ==========================================================
// Dashboard
// ==========================================================

// Dashboard Counts
router.get(
    "/dashboard",
    ...protect("Roles & Permissions", "view"),
    RoleController.getDashboardCounts
);

// ==========================================================
// Roles
// ==========================================================

// Get All Roles
router.get(
    "/",
    ...protect("Roles & Permissions", "view"),
    RoleController.getAllRoles
);

// Get Role By ID
router.get(
    "/:id",
    ...protect("Roles & Permissions", "view"),
    RoleController.getRoleById
);

// Create Role
router.post(
    "/",
    ...protect("Roles & Permissions", "create"),
    RoleController.createRole
);

// Update Role
router.put(
    "/:id",
    ...protect("Roles & Permissions", "edit"),
    RoleController.updateRole
);

// Delete Role
router.delete(
    "/:id",
    ...protect("Roles & Permissions", "delete"),
    RoleController.deleteRole
);

// Update Role Status
router.patch(
    "/:id/status",
    ...protect("Roles & Permissions", "edit"),
    RoleController.updateRoleStatus
);

// Duplicate Role
router.post(
    "/:id/duplicate",
    ...protect("Roles & Permissions", "create"),
    RoleController.duplicateRole
);

// ==========================================================
// Role Permissions
// ==========================================================

// Get Role Permissions
router.get(
    "/:id/permissions",
    ...protect("Roles & Permissions", "view"),
    RoleController.getRolePermissions
);

// Save Role Permissions
router.put(
    "/:id/permissions",
    ...protect("Roles & Permissions", "edit"),
    RoleController.saveRolePermissions
);

// ==========================================================
// Assigned Users
// ==========================================================

// Get Assigned Users
router.get(
    "/:id/users",
    ...protect("Roles & Permissions", "view"),
    RoleController.getAssignedUsers
);

// ==========================================================
// Audit Logs
// ==========================================================

// Get Role Audit Logs
router.get(
    "/:id/audit-logs",
    ...protect("Audit Logs", "view"),
    RoleController.getRoleAuditLogs
);

module.exports = router;
