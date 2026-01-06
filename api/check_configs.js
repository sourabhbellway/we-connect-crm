const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const configs = await prisma.fieldConfig.findMany({
        where: { entityType: 'lead' },
        orderBy: { displayOrder: 'asc' }
    });
    console.log(JSON.stringify(configs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
