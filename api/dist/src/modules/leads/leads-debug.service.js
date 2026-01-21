"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsDebugService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let LeadsDebugService = class LeadsDebugService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateLeadData(data) {
        console.log('\n========================================');
        console.log('🔍 LEAD VALIDATION DEBUG STARTED');
        console.log('========================================\n');
        console.log('📤 INCOMING DATA:');
        console.log(JSON.stringify(data, null, 2));
        const fieldConfigs = await this.prisma.fieldConfig.findMany({
            where: { entityType: 'lead', isVisible: true },
            orderBy: { displayOrder: 'asc' },
        });
        console.log('\n📋 FIELD CONFIGURATIONS FOUND:', fieldConfigs.length);
        if (fieldConfigs.length > 0) {
            console.log('\nField Configs:');
            fieldConfigs.forEach((config, idx) => {
                console.log(`  ${idx + 1}. ${config.fieldName}`);
                console.log(`     - Label: ${config.label}`);
                console.log(`     - Required: ${config.isRequired}`);
                console.log(`     - Visible: ${config.isVisible}`);
                console.log(`     - Validation: ${JSON.stringify(config.validation)}`);
                console.log(`     - Section: ${config.section}`);
            });
        }
        else {
            console.log('⚠️  NO FIELD CONFIGURATIONS FOUND - validation will be skipped!');
            console.log('💡 TIP: Add field configurations in the database or disable dynamic validation');
        }
        const errors = {};
        const validationDetails = [];
        for (const config of fieldConfigs) {
            const fieldName = config.fieldName;
            const directValue = data[fieldName] !== undefined ? data[fieldName] : undefined;
            const customFieldValue = data.customFields?.[fieldName];
            const serviceInterestFields = ['primaryServiceCategory', 'wasteCategory', 'servicePreference', 'serviceFrequency', 'expectedStartDate', 'urgencyLevel'];
            const commercialExpectationFields = ['billingPreference', 'estimatedJobDuration'];
            let value = directValue;
            if (directValue === undefined && (serviceInterestFields.includes(fieldName) || commercialExpectationFields.includes(fieldName))) {
                value = customFieldValue;
            }
            const fieldDebug = {
                fieldName,
                label: config.label,
                isRequired: config.isRequired,
                value,
                valueType: typeof value,
                isEmpty: value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0),
                validation: config.validation,
            };
            validationDetails.push(fieldDebug);
            console.log(`\n🔎 VALIDATING FIELD: ${fieldName}`);
            console.log(`   Value: ${JSON.stringify(value)} (${typeof value})`);
            console.log(`   Required: ${config.isRequired}`);
            if (config.isRequired) {
                if (value === undefined || value === null || value === '' ||
                    (Array.isArray(value) && value.length === 0) ||
                    (typeof value === 'string' && !value.trim())) {
                    errors[fieldName] = `${config.label || fieldName} is required`;
                    console.log(`   ❌ ERROR: Field is required but empty`);
                    continue;
                }
                console.log(`   ✅ Required check passed`);
            }
            if (value === undefined || value === null || value === '' ||
                (Array.isArray(value) && value.length === 0)) {
                console.log(`   ⏭️  Skipping type validation - empty value`);
                continue;
            }
            const validation = config.validation;
            if (validation?.type) {
                console.log(`   🔧 Running ${validation.type} validation`);
                switch (validation.type) {
                    case 'email':
                        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
                        if (!emailRegex.test(String(value))) {
                            errors[fieldName] = `${config.label} must be a valid email address`;
                            console.log(`   ❌ Email validation failed`);
                        }
                        else {
                            console.log(`   ✅ Email validation passed`);
                        }
                        break;
                    case 'phone':
                        const phoneRegex = /^[0-9+\s()-]+$/;
                        const digitsOnly = String(value).replace(/\D/g, '');
                        if (!phoneRegex.test(String(value)) || digitsOnly.length < 7 || digitsOnly.length > 15) {
                            errors[fieldName] = `${config.label} must be a valid phone number`;
                            console.log(`   ❌ Phone validation failed`);
                        }
                        else {
                            console.log(`   ✅ Phone validation passed`);
                        }
                        break;
                    case 'number':
                        const numValue = Number(value);
                        if (isNaN(numValue)) {
                            errors[fieldName] = `${config.label} must be a valid number`;
                            console.log(`   ❌ Number validation failed - NaN`);
                        }
                        else {
                            if (validation.min !== undefined && numValue < validation.min) {
                                errors[fieldName] = `${config.label} must be at least ${validation.min}`;
                                console.log(`   ❌ Number validation failed - below min`);
                            }
                            else if (validation.max !== undefined && numValue > validation.max) {
                                errors[fieldName] = `${config.label} must be at most ${validation.max}`;
                                console.log(`   ❌ Number validation failed - above max`);
                            }
                            else {
                                console.log(`   ✅ Number validation passed`);
                            }
                        }
                        break;
                    case 'url':
                        try {
                            new URL(String(value));
                            console.log(`   ✅ URL validation passed`);
                        }
                        catch {
                            errors[fieldName] = `${config.label} must be a valid URL`;
                            console.log(`   ❌ URL validation failed`);
                        }
                        break;
                    case 'text':
                        const textValue = String(value);
                        let textError = false;
                        if (validation.minLength !== undefined && textValue.length < validation.minLength) {
                            errors[fieldName] = `${config.label} must be at least ${validation.minLength} characters`;
                            textError = true;
                        }
                        if (validation.maxLength !== undefined && textValue.length > validation.maxLength) {
                            errors[fieldName] = `${config.label} must not exceed ${validation.maxLength} characters`;
                            textError = true;
                        }
                        if (validation.pattern) {
                            const pattern = new RegExp(validation.pattern);
                            if (!pattern.test(textValue)) {
                                errors[fieldName] = `${config.label} format is invalid`;
                                textError = true;
                            }
                        }
                        if (textError) {
                            console.log(`   ❌ Text validation failed`);
                        }
                        else {
                            console.log(`   ✅ Text validation passed`);
                        }
                        break;
                    default:
                        console.log(`   ⚠️  Unknown validation type: ${validation.type}`);
                }
            }
            else {
                console.log(`   ⚠️  No validation rules configured`);
            }
        }
        console.log('\n========================================');
        console.log('📊 VALIDATION SUMMARY');
        console.log('========================================');
        console.log(`Total fields checked: ${fieldConfigs.length}`);
        console.log(`Fields with errors: ${Object.keys(errors).length}`);
        console.log(`Errors:`, JSON.stringify(errors, null, 2));
        console.log('========================================\n');
        return {
            success: Object.keys(errors).length === 0,
            message: Object.keys(errors).length === 0 ? 'Validation passed' : 'Validation failed',
            errors,
            validationDetails,
            fieldConfigCount: fieldConfigs.length,
        };
    }
};
exports.LeadsDebugService = LeadsDebugService;
exports.LeadsDebugService = LeadsDebugService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsDebugService);
//# sourceMappingURL=leads-debug.service.js.map