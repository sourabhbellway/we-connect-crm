const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        emailVerified: true,
        roles: {
          select: {
            role: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    console.log('Users in database:', JSON.stringify(users, null, 2));
    
    const settings = await prisma.businessSettings.findFirst();
    console.log('Business settings exist:', !!settings);
    
    if (settings) {
      console.log('Password requirements:', {
        minLength: settings.passwordMinLength,
        requireUpper: settings.passwordRequireUpper,
        requireLower: settings.passwordRequireLower,
        requireNumber: settings.passwordRequireNumber,
        requireSymbol: settings.passwordRequireSymbol
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();