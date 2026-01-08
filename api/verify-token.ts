
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { id: 1 },
        select: { fcmToken: true }
    });

    if (user && user.fcmToken) {
        console.log('\n--- FULL TOKEN START ---');
        // Print in chunks of 60 characters to ensure it's not truncated in logs
        for (let i = 0; i < user.fcmToken.length; i += 60) {
            console.log(user.fcmToken.substring(i, i + 60));
        }
        console.log('--- FULL TOKEN END ---\n');
    } else {
        console.log('No Token Found for User 1');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
