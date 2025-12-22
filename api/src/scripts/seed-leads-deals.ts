import { PrismaClient, LeadPriority, Prisma, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

const LEAD_SOURCES = [
    { name: 'Website', color: '#3B82F6' },
    { name: 'Referral', color: '#10B981' },
    { name: 'Cold Call', color: '#F59E0B' },
    { name: 'LinkedIn', color: '#0A66C2' },
    { name: 'Email Campaign', color: '#8B5CF6' },
];

const INDUSTRIES = [
    'Technology',
    'Healthcare',
    'Finance',
    'Real Estate',
    'Manufacturing',
    'Retail',
];

const LEAD_STATUS_NAMES = Object.values(LeadStatus);
const DEAL_STATUS_NAMES = ['DRAFT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'CLOSED'];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('🌱 Starting Leads & Deals seeding...');

    // 1. Get Admin User to assign items to
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@weconnect.com' },
    });

    if (!adminUser) {
        console.error('❌ Admin user not found. Please run the main seed script first.');
        return;
    }

    // 2. Create Lead Sources
    console.log('Creating Lead Sources...');
    const sourceIds: number[] = [];
    for (const source of LEAD_SOURCES) {
        const upserted = await prisma.leadSource.upsert({
            where: { name: source.name },
            update: {},
            create: {
                name: source.name,
                color: source.color,
                isActive: true,
            },
        });
        sourceIds.push(upserted.id);
    }

    // 3. Create Deal Statuses
    console.log('Creating Deal Statuses...');
    for (let i = 0; i < DEAL_STATUS_NAMES.length; i++) {
        await prisma.dealStatus.upsert({
            where: { name: DEAL_STATUS_NAMES[i] },
            update: {},
            create: {
                name: DEAL_STATUS_NAMES[i],
                sortOrder: i,
                isActive: true,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
            },
        });
    }

    // 4. Create Leads
    console.log('Creating Leads...');
    const leads: any[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 6 months ago
    const endDate = new Date();

    for (let i = 1; i <= 50; i++) {
        const status = getRandomElement(LEAD_STATUS_NAMES);
        const createdAt = getRandomDate(startDate, endDate);

        // Logic for status-dependent dates
        let lastContactedAt: Date | null = null;
        if (status !== 'NEW') {
            lastContactedAt = getRandomDate(createdAt, endDate);
        }

        const lead = await prisma.lead.create({
            data: {
                firstName: `LeadFirst${i}`,
                lastName: `LeadLast${i}`,
                email: `lead${i}@example.com`,
                phone: `+1-555-01${i.toString().padStart(2, '0')}`,
                company: `Company ${i}`,
                position: 'Decision Maker',
                status: status,
                sourceId: getRandomElement(sourceIds),
                assignedTo: adminUser.id,
                industry: getRandomElement(INDUSTRIES),
                budget: new Prisma.Decimal(Math.floor(Math.random() * 50000) + 5000),
                createdAt: createdAt,
                updatedAt: createdAt, // simplified
                lastContactedAt: lastContactedAt,
                isActive: true,
            },
        });
        leads.push(lead);
    }
    console.log(`✅ Created ${leads.length} leads.`);

    // 5. Create Deals
    console.log('Creating Deals...');
    let dealsCount = 0;

    // Create deals for about 60% of leads
    for (const lead of leads) {
        if (Math.random() > 0.4) {
            const status = getRandomElement(DEAL_STATUS_NAMES); // Use deal statuses
            const value = Math.floor(Math.random() * 100000) + 10000;

            // Ensure deal creation is after lead creation
            const createdAt = getRandomDate(lead.createdAt, endDate);

            let actualCloseDate: Date | null = null;
            if (status === 'WON' || status === 'LOST' || status === 'CLOSED') {
                actualCloseDate = getRandomDate(createdAt, endDate);
            }

            await prisma.deal.create({
                data: {
                    title: `Deal for ${lead.company}`,
                    description: `Potential contract with ${lead.company}`,
                    value: new Prisma.Decimal(value),
                    status: status,
                    probability: status === 'WON' || status === 'CLOSED' ? 100 : (status === 'LOST' ? 0 : 50),
                    leadId: lead.id,
                    assignedTo: adminUser.id,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                    expectedCloseDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
                    actualCloseDate: actualCloseDate,
                    isActive: true,
                },
            });
            dealsCount++;

            // If deal is WON, ensure lead is CONVERTED (if not already)
            if ((status === 'WON' || status === 'CLOSED') && lead.status !== 'CONVERTED') {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: LeadStatus.CONVERTED },
                });
            }
        }
    }
    console.log(`✅ Created ${dealsCount} deals.`);

    console.log('🎉 Leads & Deals seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
