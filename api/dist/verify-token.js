"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.findUnique({
        where: { id: 1 },
        select: { fcmToken: true }
    });
    if (user && user.fcmToken) {
        console.log('\n--- FULL TOKEN START ---');
        for (let i = 0; i < user.fcmToken.length; i += 60) {
            console.log(user.fcmToken.substring(i, i + 60));
        }
        console.log('--- FULL TOKEN END ---\n');
    }
    else {
        console.log('No Token Found for User 1');
    }
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=verify-token.js.map