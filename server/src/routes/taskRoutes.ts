import express from 'express';
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  getTaskStats 
} from '../controllers/taskController';
import { authenticateToken, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get all tasks with filtering
router.get('/tasks', authenticateToken, requirePermission('task.read'), getTasks);

// Get task statistics
router.get('/tasks/stats', authenticateToken, requirePermission('task.read'), getTaskStats);

// Get task by ID
router.get('/tasks/:id', authenticateToken, requirePermission('task.read'), getTaskById);

// Create new task
router.post('/tasks', authenticateToken, requirePermission('task.create'), createTask);

// Update task
router.put('/tasks/:id', authenticateToken, requirePermission('task.update'), updateTask);

// Delete task (soft delete)
router.delete('/tasks/:id', authenticateToken, requirePermission('task.delete'), deleteTask);

export default router;