
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const correctToken = "f2w9914nSJaXmedmI-ViSd:APA91bEyAfyvJxh-EsPGyueB0SUDXrwyStHn9tp2yhO7f2kv--stJtbojh1_V7Y4B9BEGS4NYVipLOuIn1N0yewLgWMUuC7xs3TG7qTLPpAOJVaw3dufHLk";

async function main() {
    console.log('Updating Token...');
    const user = await prisma.user.update({
        where: { id: 1 },
        data: { fcmToken: correctToken }
    });

    console.log('--- UPDATED TOKEN STATUS ---');
    console.log(`User ID: ${user.id}`);
    console.log(`Token Saved: ${user.fcmToken}`);
    console.log('----------------------------');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
