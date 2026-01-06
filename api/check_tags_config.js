const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tagsConfig = await prisma.fieldConfig.findFirst({
        where: { entityType: 'lead', fieldName: 'tags' }
    });
    console.log('Tags Config:', tagsConfig);

    const allConfigs = await prisma.fieldConfig.findMany({
        where: { entityType: 'lead' },
        select: { fieldName: true }
    });
    console.log('All Lead Field Names:', allConfigs.map(c => c.fieldName));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
