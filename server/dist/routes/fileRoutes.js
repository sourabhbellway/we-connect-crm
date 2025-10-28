"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileController_1 = require("../controllers/fileController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Upload file
router.post('/upload', fileController_1.upload.single('file'), fileController_1.uploadFile);
// Get files for an entity
router.get('/', fileController_1.getFiles);
// Delete file
router.delete('/:id', fileController_1.deleteFile);
// Download file
router.get('/:id/download', fileController_1.downloadFile);
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map