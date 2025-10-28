"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all tasks with filtering
router.get('/tasks', auth_1.authenticateToken, (0, auth_1.requirePermission)('task.read'), taskController_1.getTasks);
// Get task statistics
router.get('/tasks/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('task.read'), taskController_1.getTaskStats);
// Get task by ID
router.get('/tasks/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('task.read'), taskController_1.getTaskById);
// Create new task
router.post('/tasks', auth_1.authenticateToken, (0, auth_1.requirePermission)('task.create'), taskController_1.createTask);
// Update task
router.put('/tasks/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('task.update'), taskController_1.updateTask);
// Delete task (soft delete)
router.delete('/tasks/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('task.delete'), taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map