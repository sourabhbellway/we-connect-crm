const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const configs = await prisma.fieldConfig.findMany({
        where: { entityType: 'lead' },
        select: { fieldName: true, label: true, isVisible: true }
    });
    console.log(configs);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
