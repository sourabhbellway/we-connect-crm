import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            fcmToken: true,
            deviceToken: true
        },
        take: 10
    });

    console.log('--- User Tokens ---');
    users.forEach(user => {
        console.log(`ID: ${user.id}, Email: ${user.email}, FCM: ${user.fcmToken ? 'Exists' : 'NULL'}, Device: ${user.deviceToken ? 'Exists' : 'NULL'}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
