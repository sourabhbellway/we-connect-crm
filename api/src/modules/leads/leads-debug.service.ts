import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Debug service for testing lead validation without saving
@Injectable()
export class LeadsDebugService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate lead data without saving - for debugging purposes
   * Returns detailed validation results including field configurations
   */
  async validateLeadData(data: any) {
    console.log('\n========================================');
    console.log('🔍 LEAD VALIDATION DEBUG STARTED');
    console.log('========================================\n');

    // Log incoming data
    console.log('📤 INCOMING DATA:');
    console.log(JSON.stringify(data, null, 2));

    // Get field configurations
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
    } else {
      console.log('⚠️  NO FIELD CONFIGURATIONS FOUND - validation will be skipped!');
      console.log('💡 TIP: Add field configurations in the database or disable dynamic validation');
    }

    const errors: Record<string, string> = {};
    const validationDetails: any[] = [];

    // Validation loop
    for (const config of fieldConfigs) {
      const fieldName = config.fieldName;
      
      // Check both direct form fields and customFields
      const directValue = data[fieldName] !== undefined ? data[fieldName] : undefined;
      const customFieldValue = (data.customFields as any)?.[fieldName];
      
      // For Service Interest and Commercial Expectation fields
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

      // Required validation
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

      // Skip further validation if empty and not required
      if (value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
        console.log(`   ⏭️  Skipping type validation - empty value`);
        continue;
      }

      // Type-specific validation
      const validation = config.validation as any;
      if (validation?.type) {
        console.log(`   🔧 Running ${validation.type} validation`);
        
        switch (validation.type) {
          case 'email':
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(String(value))) {
              errors[fieldName] = `${config.label} must be a valid email address`;
              console.log(`   ❌ Email validation failed`);
            } else {
              console.log(`   ✅ Email validation passed`);
            }
            break;

          case 'phone':
            const phoneRegex = /^[0-9+\s()-]+$/;
            const digitsOnly = String(value).replace(/\D/g, '');
            if (!phoneRegex.test(String(value)) || digitsOnly.length < 7 || digitsOnly.length > 15) {
              errors[fieldName] = `${config.label} must be a valid phone number`;
              console.log(`   ❌ Phone validation failed`);
            } else {
              console.log(`   ✅ Phone validation passed`);
            }
            break;

          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue)) {
              errors[fieldName] = `${config.label} must be a valid number`;
              console.log(`   ❌ Number validation failed - NaN`);
            } else {
              if (validation.min !== undefined && numValue < validation.min) {
                errors[fieldName] = `${config.label} must be at least ${validation.min}`;
                console.log(`   ❌ Number validation failed - below min`);
              } else if (validation.max !== undefined && numValue > validation.max) {
                errors[fieldName] = `${config.label} must be at most ${validation.max}`;
                console.log(`   ❌ Number validation failed - above max`);
              } else {
                console.log(`   ✅ Number validation passed`);
              }
            }
            break;

          case 'url':
            try {
              new URL(String(value));
              console.log(`   ✅ URL validation passed`);
            } catch {
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
            } else {
              console.log(`   ✅ Text validation passed`);
            }
            break;

          default:
            console.log(`   ⚠️  Unknown validation type: ${validation.type}`);
        }
      } else {
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
}

