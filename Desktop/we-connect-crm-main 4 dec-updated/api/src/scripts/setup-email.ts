import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupEmailProvider() {
  console.log('🔧 Setting up email provider...');

  // Check if an EMAIL provider already exists
  const existingProvider = await prisma.communicationProvider.findFirst({
    where: { type: 'EMAIL' },
  });

  if (existingProvider) {
    console.log('ℹ️  Email provider already exists');
    return;
  }

  // Create a basic SMTP provider (you can update these values)
  const provider = await prisma.communicationProvider.create({
    data: {
      name: 'Default SMTP Provider',
      type: 'EMAIL',
      config: {
        // SMTP Configuration - Update these with your actual SMTP settings
        smtpHost: 'smtp.gmail.com', // or your SMTP host
        smtpPort: 587, // 587 for TLS, 465 for SSL, 25 for plain
        smtpUser: 'your-email@gmail.com', // your SMTP username
        smtpPassword: 'your-app-password', // your SMTP password/app password
        fromEmail: 'noreply@weconnect.com', // from email address
        fromName: 'WeConnect CRM', // from name
      },
      isActive: true,
      isDefault: true,
    },
  });

  console.log('✅ Email provider created successfully!');
  console.log('📧 Provider ID:', provider.id);
  console.log('⚠️  Please update the SMTP configuration in the database with your actual email provider settings');
  console.log('   - smtpHost: Your SMTP server hostname');
  console.log('   - smtpPort: Usually 587 (TLS) or 465 (SSL)');
  console.log('   - smtpUser: Your email address or SMTP username');
  console.log('   - smtpPassword: Your email password or app-specific password');
  console.log('   - fromEmail: The email address emails will be sent from');
  console.log('   - fromName: The name that appears as the sender');
  console.log('');
  console.log('🔍 You can update these settings via:');
  console.log('   - API: POST /api/communication/providers');
  console.log('   - Or directly in the database communication_providers table');
}

setupEmailProvider()
  .catch((e) => {
    console.error('❌ Email provider setup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });