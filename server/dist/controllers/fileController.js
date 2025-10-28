"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.deleteFile = exports.getFiles = exports.uploadFile = exports.upload = void 0;
const prisma_1 = require("../lib/prisma");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file upload
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }
        const { entityType, entityId } = req.body;
        const userId = req.user?.id;
        if (!entityType || !entityId) {
            return res.status(400).json({
                success: false,
                message: 'Entity type and ID are required',
            });
        }
        const file = await prisma_1.prisma.file.create({
            data: {
                name: req.file.originalname,
                fileName: req.file.filename,
                filePath: req.file.path,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                entityType: entityType.toUpperCase(),
                entityId: parseInt(entityId),
                uploadedBy: userId,
            },
            include: {
                uploadedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: { file },
            message: 'File uploaded successfully',
        });
    }
    catch (error) {
        console.error('Upload file error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.uploadFile = uploadFile;
const getFiles = async (req, res) => {
    try {
        const { entityType, entityId } = req.query;
        if (!entityType || !entityId) {
            return res.status(400).json({
                success: false,
                message: 'Entity type and ID are required',
            });
        }
        const files = await prisma_1.prisma.file.findMany({
            where: {
                entityType: entityType.toUpperCase(),
                entityId: parseInt(entityId),
                deletedAt: null,
            },
            include: {
                uploadedByUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: { files },
        });
    }
    catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getFiles = getFiles;
const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await prisma_1.prisma.file.findUnique({
            where: { id: parseInt(id) },
        });
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
            });
        }
        // Soft delete
        await prisma_1.prisma.file.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() },
        });
        // Optionally delete physical file
        if (fs_1.default.existsSync(file.filePath)) {
            fs_1.default.unlinkSync(file.filePath);
        }
        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.deleteFile = deleteFile;
const downloadFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await prisma_1.prisma.file.findUnique({
            where: { id: parseInt(id), deletedAt: null },
        });
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
            });
        }
        if (!fs_1.default.existsSync(file.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server',
            });
        }
        res.download(file.filePath, file.name);
    }
    catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.downloadFile = downloadFile;
//# sourceMappingURL=fileController.js.map