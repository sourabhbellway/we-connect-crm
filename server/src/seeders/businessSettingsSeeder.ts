import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedBusinessSettings() {
  console.log('🔧 Seeding business settings...');

  const existingSettings = await prisma.businessSettings.findFirst();

  if (!existingSettings) {
    await prisma.businessSettings.create({
      data: {
        companyName: 'WeConnect CRM',
        companyEmail: 'admin@weconnect-crm.com',
        companyPhone: '+1-234-567-8900',
        companyAddress: '123 Business Street, City, State 12345',
        companyWebsite: 'https://weconnect-crm.com',
        timeZone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        passwordMinLength: 8,
        passwordRequireUpper: true,
        passwordRequireLower: true,
        passwordRequireNumber: true,
        passwordRequireSymbol: true,
        sessionTimeout: 24, // hours
        maxLoginAttempts: 5,
        accountLockDuration: 30, // minutes
        twoFactorRequired: false,
        emailVerificationRequired: false, // Set to false for development
      },
    });

    console.log('✅ Default business settings created');
  } else {
    console.log('ℹ️  Business settings already exist, skipping...');
  }
}

export default seedBusinessSettings;