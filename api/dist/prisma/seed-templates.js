"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Invoice Templates...');
    await prisma.invoiceTemplate.deleteMany({});
    console.log('Deleted existing templates.');
    const defaults = [
        {
            name: 'Blue Theme',
            description: 'Professional Job Card layout in Blue.',
            designType: 'job_card',
            isDefault: true,
            primaryColor: '#2563EB',
            secondaryColor: '#DBEAFE',
        },
        {
            name: 'Red Theme',
            description: 'Professional Job Card layout in Red.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#DC2626',
            secondaryColor: '#FEE2E2',
        },
        {
            name: 'Green Theme',
            description: 'Professional Job Card layout in Green.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#16A34A',
            secondaryColor: '#DCFCE7',
        },
        {
            name: 'Orange Theme',
            description: 'Professional Job Card layout in Orange.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#EA580C',
            secondaryColor: '#FFEDD5',
        },
        {
            name: 'Purple Theme',
            description: 'Professional Job Card layout in Purple.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#9333EA',
            secondaryColor: '#F3E8FF',
        },
    ];
    for (const template of defaults) {
        await prisma.invoiceTemplate.create({
            data: {
                ...template,
                isActive: true,
                headerContent: '',
                footerContent: '',
                termsAndConditions: 'Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.',
            },
        });
    }
    console.log('Seeding completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-templates.js.map