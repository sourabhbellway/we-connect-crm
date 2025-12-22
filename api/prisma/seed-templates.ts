import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Invoice Templates...');

    // Delete existing templates
    await prisma.invoiceTemplate.deleteMany({});
    console.log('Deleted existing templates.');

    const defaults = [
        {
            name: 'Blue Theme',
            description: 'Professional Job Card layout in Blue.',
            designType: 'job_card',
            isDefault: true,
            primaryColor: '#2563EB', // Blue
            secondaryColor: '#DBEAFE', // Light Blue
        },
        {
            name: 'Red Theme',
            description: 'Professional Job Card layout in Red.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#DC2626', // Red
            secondaryColor: '#FEE2E2', // Light Red
        },
        {
            name: 'Green Theme',
            description: 'Professional Job Card layout in Green.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#16A34A', // Green
            secondaryColor: '#DCFCE7', // Light Green
        },
        {
            name: 'Orange Theme',
            description: 'Professional Job Card layout in Orange.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#EA580C', // Orange
            secondaryColor: '#FFEDD5', // Light Orange
        },
        {
            name: 'Purple Theme',
            description: 'Professional Job Card layout in Purple.',
            designType: 'job_card',
            isDefault: false,
            primaryColor: '#9333EA', // Purple
            secondaryColor: '#F3E8FF', // Light Purple
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
