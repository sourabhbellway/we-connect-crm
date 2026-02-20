
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const keysToCheck = [
        'lead.transfer',
        'business_settings_tax.create',
        'notes.create',
        'payments.create',
        'trash.read'
    ];

    const permissions = await prisma.permission.findMany({
        where: {
            key: { in: keysToCheck }
        }
    });

    console.log('Found Permissions:', permissions.length);
    permissions.forEach(p => console.log(`- ${p.key}: ${p.name}`));

    const allCount = await prisma.permission.count();
    console.log('Total Permissions in DB:', allCount);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
