"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting Business Data seeding...');
    const users = await prisma.user.findMany();
    const companies = await prisma.companies.findMany();
    const leads = await prisma.lead.findMany();
    const deals = await prisma.deal.findMany();
    if (users.length === 0) {
        console.log('❌ No users found. Please run seed.ts first.');
        return;
    }
    console.log('Creating Products...');
    const products = [
        {
            name: 'Web Development Service',
            description: 'Complete web application development',
            sku: 'WD-001',
            type: 'SERVICE',
            category: 'Digital Services',
            price: 5000.00,
            currency: 'USD',
            unit: 'project',
            taxRate: 18.00,
            hsnCode: '998313',
            isActive: true,
        },
        {
            name: 'Mobile App Development',
            description: 'iOS and Android mobile application',
            sku: 'MA-001',
            type: 'SERVICE',
            category: 'Digital Services',
            price: 8000.00,
            currency: 'USD',
            unit: 'project',
            taxRate: 18.00,
            hsnCode: '998313',
            isActive: true,
        },
        {
            name: 'CRM Software License',
            description: 'Annual software license for CRM system',
            sku: 'SL-001',
            type: 'DIGITAL',
            category: 'Software',
            price: 1200.00,
            currency: 'USD',
            unit: 'license',
            taxRate: 18.00,
            hsnCode: '998313',
            isActive: true,
        },
        {
            name: 'Consulting Services',
            description: 'Business consulting and strategy',
            sku: 'CS-001',
            type: 'SERVICE',
            category: 'Consulting',
            price: 200.00,
            currency: 'USD',
            unit: 'hour',
            taxRate: 18.00,
            hsnCode: '998313',
            isActive: true,
        },
        {
            name: 'Training Workshop',
            description: 'Employee training and development',
            sku: 'TW-001',
            type: 'SERVICE',
            category: 'Education',
            price: 1500.00,
            currency: 'USD',
            unit: 'session',
            taxRate: 18.00,
            hsnCode: '998313',
            isActive: true,
        },
    ];
    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: product,
            create: product,
        });
    }
    console.log('✅ Created sample products.');
    console.log('Creating Tasks...');
    const tasks = [
        {
            title: 'Follow up with TechCorp lead',
            description: 'Call John Doe to discuss requirements',
            status: 'PENDING',
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            assignedTo: users[0].id,
            createdBy: users[0].id,
            leadId: leads[0]?.id,
        },
        {
            title: 'Prepare proposal for GlobalTech',
            description: 'Create detailed technical proposal',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            assignedTo: users[0].id,
            createdBy: users[0].id,
            dealId: deals[0]?.id,
        },
        {
            title: 'Review contract terms',
            description: 'Legal review of contract with StartupXYZ',
            status: 'PENDING',
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            assignedTo: users[0].id,
            createdBy: users[0].id,
        },
        {
            title: 'Schedule demo session',
            description: 'Product demo for potential client',
            status: 'COMPLETED',
            priority: 'MEDIUM',
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            assignedTo: users[0].id,
            createdBy: users[0].id,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    ];
    for (const task of tasks) {
        await prisma.task.create({
            data: task,
        });
    }
    console.log('✅ Created sample tasks.');
    console.log('Creating Expenses...');
    const expenses = [
        {
            expenseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            amount: 150.00,
            type: 'TRAVEL',
            category: 'Flight tickets',
            description: 'Business trip to client location',
            status: 'APPROVED',
            submittedBy: users[0].id,
            approvedBy: users[0].id,
            approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            currency: 'USD',
            dealId: deals[0]?.id,
        },
        {
            expenseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            amount: 75.50,
            type: 'MEALS',
            category: 'Client meeting',
            description: 'Lunch meeting with potential client',
            status: 'PENDING',
            submittedBy: users[0].id,
            currency: 'USD',
        },
        {
            expenseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            amount: 299.99,
            type: 'EQUIPMENT',
            category: 'Office supplies',
            description: 'New laptop for development work',
            status: 'APPROVED',
            submittedBy: users[0].id,
            approvedBy: users[0].id,
            approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            currency: 'USD',
        },
        {
            expenseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            amount: 45.00,
            type: 'SOFTWARE',
            category: 'Development tools',
            description: 'Monthly subscription for design software',
            status: 'APPROVED',
            submittedBy: users[0].id,
            approvedBy: users[0].id,
            approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            currency: 'USD',
        },
    ];
    for (const expense of expenses) {
        await prisma.expense.create({
            data: expense,
        });
    }
    console.log('✅ Created sample expenses.');
    const createdProducts = await prisma.product.findMany();
    console.log('Creating Quotations...');
    const quotations = [
        {
            quotationNumber: 'Q-001',
            title: 'Web Development Project',
            description: 'Complete e-commerce website development',
            status: 'SENT',
            subtotal: 5000.00,
            taxAmount: 900.00,
            discountAmount: 0.00,
            totalAmount: 5900.00,
            currency: 'USD',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            notes: 'Valid for 30 days from issue date',
            terms: 'Payment due within 15 days of acceptance',
            companyId: companies[0]?.id,
            leadId: leads[0]?.id,
            createdBy: users[0].id,
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            quotationNumber: 'Q-002',
            title: 'Mobile App Development',
            description: 'iOS and Android app development',
            status: 'ACCEPTED',
            subtotal: 8000.00,
            taxAmount: 1440.00,
            discountAmount: 400.00,
            totalAmount: 9040.00,
            currency: 'USD',
            validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            notes: 'Includes 6 months post-launch support',
            terms: '50% upfront, 50% on completion',
            companyId: companies[1]?.id,
            dealId: deals[0]?.id,
            createdBy: users[0].id,
            sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            acceptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    ];
    for (const quotation of quotations) {
        const createdQuotation = await prisma.quotation.create({
            data: quotation,
        });
        if (createdProducts.length > 0) {
            const items = [
                {
                    quotationId: createdQuotation.id,
                    productId: createdProducts[0].id,
                    name: createdProducts[0].name,
                    description: createdProducts[0].description,
                    quantity: 1.00,
                    unit: createdProducts[0].unit,
                    unitPrice: createdProducts[0].price,
                    taxRate: Number(createdProducts[0].taxRate) || 0,
                    discountRate: 0.00,
                    subtotal: createdProducts[0].price,
                    totalAmount: Number(createdProducts[0].price) * (1 + (Number(createdProducts[0].taxRate) || 0) / 100),
                    sortOrder: 1,
                },
            ];
            for (const item of items) {
                await prisma.quotationItem.create({
                    data: item,
                });
            }
        }
    }
    console.log('✅ Created sample quotations with items.');
    console.log('Creating Invoices...');
    const invoices = [
        {
            invoiceNumber: 'INV-001',
            title: 'Web Development Services',
            description: 'Development work completed for Q1',
            status: 'SENT',
            subtotal: 5000.00,
            taxAmount: 900.00,
            discountAmount: 0.00,
            totalAmount: 5900.00,
            currency: 'USD',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            notes: 'Thank you for your business',
            terms: 'Payment due within 15 days',
            companyId: companies[0]?.id,
            leadId: leads[0]?.id,
            quotationId: (await prisma.quotation.findFirst())?.id,
            createdBy: users[0].id,
            sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            invoiceNumber: 'INV-002',
            title: 'Consulting Services',
            description: 'Business strategy consulting',
            status: 'PAID',
            subtotal: 2400.00,
            taxAmount: 432.00,
            discountAmount: 0.00,
            totalAmount: 2832.00,
            currency: 'USD',
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            notes: 'Payment received via bank transfer',
            terms: 'Net 30 days',
            companyId: companies[1]?.id,
            dealId: deals[1]?.id,
            createdBy: users[0].id,
            sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    ];
    for (const invoice of invoices) {
        const createdInvoice = await prisma.invoice.create({
            data: invoice,
        });
        if (createdProducts.length > 1) {
            const items = [
                {
                    invoiceId: createdInvoice.id,
                    productId: createdProducts[1].id,
                    name: createdProducts[1].name,
                    description: createdProducts[1].description,
                    quantity: 1.00,
                    unit: createdProducts[1].unit,
                    unitPrice: createdProducts[1].price,
                    taxRate: Number(createdProducts[1].taxRate) || 0,
                    discountRate: 0.00,
                    subtotal: createdProducts[1].price,
                    totalAmount: Number(createdProducts[1].price) * (1 + (Number(createdProducts[1].taxRate) || 0) / 100),
                    sortOrder: 1,
                },
            ];
            for (const item of items) {
                await prisma.invoiceItem.create({
                    data: item,
                });
            }
        }
        if (invoice.status === 'PAID') {
            await prisma.payment.create({
                data: {
                    invoiceId: createdInvoice.id,
                    amount: invoice.totalAmount,
                    currency: invoice.currency,
                    paymentMethod: 'Bank Transfer',
                    paymentDate: invoice.paidAt,
                    referenceNumber: `REF-${createdInvoice.invoiceNumber}`,
                    createdBy: users[0].id,
                },
            });
        }
    }
    console.log('✅ Created sample invoices with items and payments.');
    console.log('🎉 Business data seeding completed!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-business-data.js.map