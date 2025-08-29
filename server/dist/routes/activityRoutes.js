"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityController_1 = require("../controllers/activityController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all activities with pagination
router.get("/activities", auth_1.authenticateToken, (0, auth_1.requirePermission)("activity.read"), activityController_1.getActivities);
// Get recent activities for dashboard
router.get("/activities/recent", auth_1.authenticateToken, (0, auth_1.requirePermission)("activity.read"), activityController_1.getRecentActivities);
// Get activity statistics
router.get("/activities/stats", auth_1.authenticateToken, (0, auth_1.requirePermission)("activity.read"), activityController_1.getActivityStats);
// Create a new activity
router.post("/activities", auth_1.authenticateToken, (0, auth_1.requirePermission)("activity.create"), activityController_1.createActivity);
exports.default = router;
//# sourceMappingURL=activityRoutes.js.map