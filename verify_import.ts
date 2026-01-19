import { PrismaClient } from '@prisma/client';
import { LeadsService } from './api/src/modules/leads/leads.service';
import * as fs from 'fs';

const prisma = new PrismaClient();
const leadsService = new LeadsService(prisma);

async function testImport() {
    console.log('--- Testing Bulk Import ---');

    // Sample tab-separated content with various fields
    const content = `First Name\tLast Name\tEmail\tPhone\tLead Source\tTags\tBudget\tAssigned To
John\tDoe\tjohn.doe.test@example.com\t1234567890\tWeb Site\tTesting, New, High Priority\t5000\tAdmin`;

    const buffer = Buffer.from(content);
    const file = {
        buffer,
        originalname: 'test_import.tsv',
        mimetype: 'text/tab-separated-values',
        fieldname: 'file',
        size: buffer.length,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
    } as Express.Multer.File;

    try {
        const result = await leadsService.bulkImportFromCsv(file);
        console.log('Import result:', JSON.stringify(result, null, 2));

        if (result.success && result.data.imported > 0) {
            // Verify in DB
            const lead = await prisma.lead.findFirst({
                where: { email: 'john.doe.test@example.com' },
                include: { source: true, tags: { include: { tag: true } } }
            });

            console.log('Created Lead:', JSON.stringify(lead, null, 2));

            if (lead) {
                console.log('✅ Name mapping: Success');
                if (lead.source?.name === 'Web Site') console.log('✅ Source mapping: Success'); else console.error('❌ Source mapping: Failed');
                if (lead.tags.length === 3) console.log('✅ Tags mapping: Success'); else console.error('❌ Tags mapping: Failed');
                if (Number(lead.budget) === 5000) console.log('✅ Budget casting: Success'); else console.error('❌ Budget casting: Failed');
            }
        } else {
            console.error('❌ Import failed or no leads imported');
        }
    } catch (err) {
        console.error('❌ Error during test:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testImport();
