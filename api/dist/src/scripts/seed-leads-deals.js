"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
const LEAD_STATUS_NAMES = Object.values(client_1.LeadStatus);
const DEAL_STATUS_NAMES = ['DRAFT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST', 'CLOSED'];
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
async function main() {
    console.log('🌱 Starting Leads & Deals seeding...');
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@weconnect.com' },
    });
    if (!adminUser) {
        console.error('❌ Admin user not found. Please run the main seed script first.');
        return;
    }
    console.log('Creating Lead Sources...');
    const sourceIds = [];
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
    console.log('Creating Leads...');
    const leads = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const endDate = new Date();
    for (let i = 1; i <= 50; i++) {
        const status = getRandomElement(LEAD_STATUS_NAMES);
        const createdAt = getRandomDate(startDate, endDate);
        let lastContactedAt = null;
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
                budget: new client_1.Prisma.Decimal(Math.floor(Math.random() * 50000) + 5000),
                createdAt: createdAt,
                updatedAt: createdAt,
                lastContactedAt: lastContactedAt,
                isActive: true,
            },
        });
        leads.push(lead);
    }
    console.log(`✅ Created ${leads.length} leads.`);
    console.log('Creating Deals...');
    let dealsCount = 0;
    for (const lead of leads) {
        if (Math.random() > 0.4) {
            const status = getRandomElement(DEAL_STATUS_NAMES);
            const value = Math.floor(Math.random() * 100000) + 10000;
            const createdAt = getRandomDate(lead.createdAt, endDate);
            let actualCloseDate = null;
            if (status === 'WON' || status === 'LOST' || status === 'CLOSED') {
                actualCloseDate = getRandomDate(createdAt, endDate);
            }
            await prisma.deal.create({
                data: {
                    title: `Deal for ${lead.company}`,
                    description: `Potential contract with ${lead.company}`,
                    value: new client_1.Prisma.Decimal(value),
                    status: status,
                    probability: status === 'WON' || status === 'CLOSED' ? 100 : (status === 'LOST' ? 0 : 50),
                    leadId: lead.id,
                    assignedTo: adminUser.id,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                    expectedCloseDate: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
                    actualCloseDate: actualCloseDate,
                    isActive: true,
                },
            });
            dealsCount++;
            if ((status === 'WON' || status === 'CLOSED') && lead.status !== 'CONVERTED') {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: client_1.LeadStatus.CONVERTED },
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
//# sourceMappingURL=seed-leads-deals.js.map