import { Router } from 'express';
import { upload, uploadFile, getFiles, deleteFile, downloadFile } from '../controllers/fileController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload file
router.post('/upload', upload.single('file'), uploadFile);

// Get files for an entity
router.get('/', getFiles);

// Delete file
router.delete('/:id', deleteFile);

// Download file
router.get('/:id/download', downloadFile);

export default router;
