const express = require("express");

const router = express.Router();

const AuthController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/permissionMiddleware");

// ==========================================================
// Session
// ==========================================================

router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);
router.post("/refresh-token", AuthController.refreshToken);

// ==========================================================
// Current User / RBAC Data
// ==========================================================

router.get("/me", verifyToken, AuthController.getMe);
router.get("/permissions", verifyToken, AuthController.getPermissions);
router.get("/sidebar", verifyToken, AuthController.getSidebar);

// ==========================================================
// Change Password (User Self-Service)
// ==========================================================

router.post("/change-password", verifyToken, AuthController.changePassword);

// ==========================================================
// Role Assignment (Admin only)
// ==========================================================

router.patch(
    "/users/:id/assign-role",
    verifyToken,
    authorizeRole(["Admin"]),
    AuthController.assignRole
);

module.exports = router;
