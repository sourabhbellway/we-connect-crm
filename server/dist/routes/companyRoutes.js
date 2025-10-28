"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all companies with filtering
router.get('/companies', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.read'), companyController_1.getCompanies);
// Get company statistics
router.get('/companies/stats', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.read'), companyController_1.getCompanyStats);
// Get company by ID
router.get('/companies/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.read'), companyController_1.getCompanyById);
// Create new company
router.post('/companies', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.create'), companyController_1.createCompany);
// Update company
router.put('/companies/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.update'), companyController_1.updateCompany);
// Delete company (soft delete)
router.delete('/companies/:id', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.delete'), companyController_1.deleteCompany);
// Get company activities
router.get('/companies/:id/activities', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.read'), companyController_1.getCompanyActivities);
// Create company activity
router.post('/companies/:id/activities', auth_1.authenticateToken, (0, auth_1.requirePermission)('company.update'), companyController_1.createCompanyActivity);
exports.default = router;
//# sourceMappingURL=companyRoutes.js.map