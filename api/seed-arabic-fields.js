const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const configs = [
        { entityType: 'lead', fieldName: 'firstNameAr', label: 'First Name (Arabic)', isRequired: false, section: 'personal', displayOrder: 2, validation: { type: 'text' } },
        { entityType: 'lead', fieldName: 'lastNameAr', label: 'Last Name (Arabic)', isRequired: false, section: 'personal', displayOrder: 4, validation: { type: 'text' } },
        { entityType: 'lead', fieldName: 'companyAr', label: 'Company (Arabic)', isRequired: false, section: 'company', displayOrder: 8, validation: { type: 'text' } },
        { entityType: 'lead', fieldName: 'addressAr', label: 'Address (Arabic)', isRequired: false, section: 'location', displayOrder: 19, validation: { type: 'textarea' } }
    ];

    for (const config of configs) {
        await prisma.fieldConfig.upsert({
            where: { entityType_fieldName: { entityType: config.entityType, fieldName: config.fieldName } },
            update: config,
            create: config
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
