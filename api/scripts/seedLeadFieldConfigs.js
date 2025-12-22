const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
cd D:\we-connect-crm-main\we-connect-crm-main\api
npm run start:devcd D:\we-connect-crm-main\we-connect-crm-main\client
npm run dev
async function seed() {
  const defaultConfigs = [
    { entityType: 'lead', fieldName: 'firstName', label: 'First Name', isRequired: true, section: 'personal', displayOrder: 1 },
    { entityType: 'lead', fieldName: 'lastName', label: 'Last Name', isRequired: true, section: 'personal', displayOrder: 2 },
    { entityType: 'lead', fieldName: 'email', label: 'Email', isRequired: true, section: 'personal', displayOrder: 3 },
    { entityType: 'lead', fieldName: 'phone', label: 'Phone', isRequired: true, section: 'personal', displayOrder: 4 },

    { entityType: 'lead', fieldName: 'company', label: 'Company', isRequired: true, section: 'company', displayOrder: 5 },
    { entityType: 'lead', fieldName: 'position', label: 'Position/Job Title', isRequired: false, section: 'company', displayOrder: 6 },
    { entityType: 'lead', fieldName: 'industry', label: 'Industry', isRequired: false, section: 'company', displayOrder: 7 },
    { entityType: 'lead', fieldName: 'website', label: 'Company Website', isRequired: false, section: 'company', displayOrder: 8 },
    { entityType: 'lead', fieldName: 'companySize', label: 'Company Size', isRequired: false, section: 'company', displayOrder: 9 },
    { entityType: 'lead', fieldName: 'annualRevenue', label: 'Annual Revenue', isRequired: false, section: 'company', displayOrder: 10 },

    { entityType: 'lead', fieldName: 'country', label: 'Country', isRequired: false, section: 'location', displayOrder: 11 },
    { entityType: 'lead', fieldName: 'state', label: 'State/Province', isRequired: false, section: 'location', displayOrder: 12 },
    { entityType: 'lead', fieldName: 'city', label: 'City', isRequired: false, section: 'location', displayOrder: 13 },
    { entityType: 'lead', fieldName: 'zipCode', label: 'ZIP/Postal Code', isRequired: false, section: 'location', displayOrder: 14 },
    { entityType: 'lead', fieldName: 'address', label: 'Address', isRequired: false, section: 'location', displayOrder: 15 },
    { entityType: 'lead', fieldName: 'timezone', label: 'Timezone', isRequired: false, section: 'location', displayOrder: 16 },
    { entityType: 'lead', fieldName: 'linkedinProfile', label: 'LinkedIn Profile', isRequired: false, section: 'location', displayOrder: 17 },

    { entityType: 'lead', fieldName: 'sourceId', label: 'Lead Source', isRequired: false, section: 'lead_management', displayOrder: 18 },
    { entityType: 'lead', fieldName: 'status', label: 'Status', isRequired: true, section: 'lead_management', displayOrder: 19 },
    { entityType: 'lead', fieldName: 'priority', label: 'Priority', isRequired: false, section: 'lead_management', displayOrder: 20 },
    { entityType: 'lead', fieldName: 'assignedTo', label: 'Assigned To', isRequired: false, section: 'lead_management', displayOrder: 21 },
    { entityType: 'lead', fieldName: 'budget', label: 'Expected Budget', isRequired: false, section: 'lead_management', displayOrder: 22 },
    { entityType: 'lead', fieldName: 'currency', label: 'Currency', isRequired: false, section: 'lead_management', displayOrder: 23 },
    { entityType: 'lead', fieldName: 'leadScore', label: 'Lead Score', isRequired: false, section: 'lead_management', displayOrder: 24 },
    { entityType: 'lead', fieldName: 'preferredContactMethod', label: 'Preferred Contact Method', isRequired: false, section: 'lead_management', displayOrder: 25 },
    { entityType: 'lead', fieldName: 'nextFollowUpAt', label: 'Next Follow-up Date', isRequired: false, section: 'lead_management', displayOrder: 26 },

    { entityType: 'lead', fieldName: 'notes', label: 'Notes', isRequired: false, section: 'notes', displayOrder: 27 },
    { entityType: 'lead', fieldName: 'tags', label: 'Tags', isRequired: false, section: 'notes', displayOrder: 28 },
  ];

  for (const cfg of defaultConfigs) {
    const existing = await prisma.fieldConfig.findUnique({ where: { entityType_fieldName: { entityType: cfg.entityType, fieldName: cfg.fieldName } } });
    if (!existing) {
      await prisma.fieldConfig.create({ data: cfg });
      console.log('Inserted', cfg.fieldName);
    } else {
      console.log('Exists', cfg.fieldName);
    }
  }

  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
