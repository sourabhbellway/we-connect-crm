const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const defaultConfigs = [
    // Lead Type & Intent Section
    { entityType: 'lead', fieldName: 'leadType', label: 'Lead Type', isRequired: true, section: 'lead', displayOrder: 1 },
    { entityType: 'lead', fieldName: 'customerType', label: 'Customer Type', isRequired: true, section: 'lead', displayOrder: 2 },

    // Service Interest Section
    { entityType: 'lead', fieldName: 'primaryServiceCategory', label: 'Primary Service Category', isRequired: true, section: 'service_interest', displayOrder: 3 },
    { entityType: 'lead', fieldName: 'wasteCategory', label: 'Waste Category', isRequired: false, section: 'service_interest', displayOrder: 4 },
    { entityType: 'lead', fieldName: 'servicePreference', label: 'Service Preference', isRequired: true, section: 'service_interest', displayOrder: 5 },
    { entityType: 'lead', fieldName: 'serviceFrequency', label: 'Service Frequency', isRequired: true, section: 'service_interest', displayOrder: 6 },
    { entityType: 'lead', fieldName: 'expectedStartDate', label: 'Expected Start Date', isRequired: false, section: 'service_interest', displayOrder: 7 },
    { entityType: 'lead', fieldName: 'urgencyLevel', label: 'Urgency Level', isRequired: true, section: 'service_interest', displayOrder: 8 },

    // Company Information Section - Moved above Personal
    { entityType: 'lead', fieldName: 'company', label: 'Company', isRequired: true, section: 'company', displayOrder: 9 },
    { entityType: 'lead', fieldName: 'position', label: 'Position/Job Title', isRequired: false, section: 'company', displayOrder: 10 },
    { entityType: 'lead', fieldName: 'industry', label: 'Industry', isRequired: false, section: 'company', displayOrder: 11 },
    { entityType: 'lead', fieldName: 'website', label: 'Company Website', isRequired: false, section: 'company', displayOrder: 12 },
    { entityType: 'lead', fieldName: 'companySize', label: 'Company Size', isRequired: false, section: 'company', displayOrder: 13 },
    { entityType: 'lead', fieldName: 'annualRevenue', label: 'Annual Revenue', isRequired: false, section: 'company', displayOrder: 14 },

    // Contact SPOC Info Section (formerly Personal Information)
    { entityType: 'lead', fieldName: 'firstName', label: 'First Name', isRequired: true, section: 'personal', displayOrder: 20 },
    { entityType: 'lead', fieldName: 'lastName', label: 'Last Name', isRequired: true, section: 'personal', displayOrder: 21 },
    { entityType: 'lead', fieldName: 'email', label: 'Email', isRequired: true, section: 'personal', displayOrder: 22 },
    { entityType: 'lead', fieldName: 'phone', label: 'Phone', isRequired: true, section: 'personal', displayOrder: 23 },

    // Commercial Expectation Section
    { entityType: 'lead', fieldName: 'billingPreference', label: 'Billing Preference', isRequired: false, section: 'commercial_expectation', displayOrder: 30 },
    { entityType: 'lead', fieldName: 'estimatedJobDuration', label: 'Estimated Job Duration (Hours)', isRequired: false, section: 'commercial_expectation', displayOrder: 31 },
    { entityType: 'lead', fieldName: 'expectedBudget', label: 'Expected Budget', isRequired: false, section: 'commercial_expectation', displayOrder: 32 },

    // Location Section
    { entityType: 'lead', fieldName: 'country', label: 'Country', isRequired: false, section: 'location', displayOrder: 40 },
    { entityType: 'lead', fieldName: 'state', label: 'State/Province', isRequired: false, section: 'location', displayOrder: 41 },
    { entityType: 'lead', fieldName: 'city', label: 'City', isRequired: false, section: 'location', displayOrder: 42 },
    { entityType: 'lead', fieldName: 'zipCode', label: 'ZIP/Postal Code', isRequired: false, section: 'location', displayOrder: 43 },
    { entityType: 'lead', fieldName: 'address', label: 'Address', isRequired: false, section: 'location', displayOrder: 44 },
    { entityType: 'lead', fieldName: 'timezone', label: 'Timezone', isRequired: false, section: 'location', displayOrder: 45 },
    { entityType: 'lead', fieldName: 'linkedinProfile', label: 'LinkedIn Profile', isRequired: false, section: 'location', displayOrder: 46 },

    // Lead Management Section
    { entityType: 'lead', fieldName: 'sourceId', label: 'Lead Source', isRequired: false, section: 'lead_management', displayOrder: 50 },
    { entityType: 'lead', fieldName: 'status', label: 'Status', isRequired: true, section: 'lead_management', displayOrder: 51 },
    { entityType: 'lead', fieldName: 'priority', label: 'Priority', isRequired: false, section: 'lead_management', displayOrder: 52 },
    { entityType: 'lead', fieldName: 'assignedTo', label: 'Assigned To', isRequired: false, section: 'lead_management', displayOrder: 53 },
    { entityType: 'lead', fieldName: 'budget', label: 'Budget', isRequired: false, section: 'lead_management', displayOrder: 54 },
    { entityType: 'lead', fieldName: 'currency', label: 'Currency', isRequired: false, section: 'lead_management', displayOrder: 55 },
    { entityType: 'lead', fieldName: 'leadScore', label: 'Deal Probability', isRequired: false, section: 'lead_management', displayOrder: 56 },
    { entityType: 'lead', fieldName: 'preferredContactMethod', label: 'Preferred Contact Method', isRequired: false, section: 'lead_management', displayOrder: 57 },
    { entityType: 'lead', fieldName: 'nextFollowUpAt', label: 'Next Follow-up Date', isRequired: false, section: 'lead_management', displayOrder: 58 },

    // Notes Section
    { entityType: 'lead', fieldName: 'notes', label: 'Notes', isRequired: false, section: 'notes', displayOrder: 60 },
    { entityType: 'lead', fieldName: 'tags', label: 'Tags', isRequired: false, section: 'notes', displayOrder: 61 },
  ];

  for (const cfg of defaultConfigs) {
    const existing = await prisma.fieldConfig.findUnique({ where: { entityType_fieldName: { entityType: cfg.entityType, fieldName: cfg.fieldName } } });
    if (!existing) {
      await prisma.fieldConfig.create({ data: cfg });
      console.log('Inserted', cfg.fieldName);
    } else {
      // Update existing record with new configuration
      await prisma.fieldConfig.update({
        where: { entityType_fieldName: { entityType: cfg.entityType, fieldName: cfg.fieldName } },
        data: {
          label: cfg.label,
          isRequired: cfg.isRequired,
          section: cfg.section,
          displayOrder: cfg.displayOrder,
          isVisible: true
        }
      });
      console.log('Updated', cfg.fieldName);
    }
  }

  await prisma.$disconnect();
  console.log('Seed completed successfully!');
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});

