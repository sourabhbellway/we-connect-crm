import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';

interface ImportRecord {
  rowIndex: number;
  data: any;
  errors: string[];
  status: 'success' | 'error' | 'pending';
  leadId?: number;
}

interface ImportResult {
  batchId: number;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
}

export class BulkImportService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private validateLeadData(data: any, rowIndex: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
      errors.push('firstName is required');
    }

    if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
      errors.push('lastName is required');
    }

    if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
      errors.push('email is required');
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('email format is invalid');
      }
    }

    // Optional field validation
    if (data.phone && typeof data.phone !== 'string') {
      errors.push('phone must be a string');
    }

    if (data.company && typeof data.company !== 'string') {
      errors.push('company must be a string');
    }

    if (data.position && typeof data.position !== 'string') {
      errors.push('position must be a string');
    }

    if (data.budget && (isNaN(parseFloat(data.budget)) || parseFloat(data.budget) < 0)) {
      errors.push('budget must be a valid positive number');
    }

    // Status validation
    if (data.status) {
      const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED', 'LOST'];
      if (!validStatuses.includes(data.status.toUpperCase())) {
        errors.push(`status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Priority validation
    if (data.priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(data.priority.toUpperCase())) {
        errors.push(`priority must be one of: ${validPriorities.join(', ')}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  private sanitizeLeadData(data: any): any {
    return {
      firstName: data.firstName?.toString().trim() || '',
      lastName: data.lastName?.toString().trim() || '',
      email: data.email?.toString().trim().toLowerCase() || '',
      phone: data.phone?.toString().trim() || null,
      company: data.company?.toString().trim() || null,
      position: data.position?.toString().trim() || null,
      notes: data.notes?.toString().trim() || null,
      status: data.status?.toString().toUpperCase() || 'NEW',
      priority: data.priority?.toString().toUpperCase() || 'MEDIUM',
      budget: data.budget ? parseFloat(data.budget) : null,
      industry: data.industry?.toString().trim() || null,
      website: data.website?.toString().trim() || null,
      address: data.address?.toString().trim() || null,
      city: data.city?.toString().trim() || null,
      state: data.state?.toString().trim() || null,
      country: data.country?.toString().trim() || null,
      zipCode: data.zipCode?.toString().trim() || null,
      linkedinProfile: data.linkedinProfile?.toString().trim() || null,
    };
  }

  async processCSVFile(filePath: string, fileName: string, createdBy: number): Promise<ImportResult> {
    const records: ImportRecord[] = [];
    let rowIndex = 0;

    // Create import batch record
    const batch = await this.prisma.leadImportBatch.create({
      data: {
        fileName,
        totalRows: 0, // Will update after processing
        createdBy,
        status: 'PROCESSING',
      },
    });

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      
      stream
        .pipe(csv({
          mapHeaders: ({ header }: { header: string }) => {
            // Normalize header names
            const normalizedHeaders: Record<string, string> = {
              'first name': 'firstName',
              'firstname': 'firstName',
              'first_name': 'firstName',
              'last name': 'lastName',
              'lastname': 'lastName',
              'last_name': 'lastName',
              'email address': 'email',
              'email_address': 'email',
              'phone number': 'phone',
              'phone_number': 'phone',
              'mobile': 'phone',
              'company name': 'company',
              'company_name': 'company',
              'organization': 'company',
              'job title': 'position',
              'job_title': 'position',
              'title': 'position',
              'zip code': 'zipCode',
              'zip_code': 'zipCode',
              'postal code': 'zipCode',
              'postal_code': 'zipCode',
              'linkedin': 'linkedinProfile',
              'linkedin_profile': 'linkedinProfile',
              'linkedin profile': 'linkedinProfile',
            };
            
            const lowerHeader = header.toLowerCase().trim();
            return normalizedHeaders[lowerHeader] || lowerHeader;
          }
        }))
        .on('data', (data: any) => {
          rowIndex++;
          const validation = this.validateLeadData(data, rowIndex);
          
          records.push({
            rowIndex,
            data: this.sanitizeLeadData(data),
            errors: validation.errors,
            status: validation.isValid ? 'pending' : 'error',
          });
        })
        .on('end', async () => {
          try {
            // Update batch with total rows
            await this.prisma.leadImportBatch.update({
              where: { id: batch.id },
              data: { totalRows: records.length },
            });

            // Process valid records
            const validRecords = records.filter(r => r.status === 'pending');
            const invalidRecords = records.filter(r => r.status === 'error');

            let successCount = 0;
            let failureCount = 0;
            const errors: Array<{ row: number; errors: string[]; data: any }> = [];

            // Add invalid records to errors
            invalidRecords.forEach(record => {
              errors.push({
                row: record.rowIndex,
                errors: record.errors,
                data: record.data,
              });
              failureCount++;
            });

            // Process valid records in batches to avoid overwhelming the database
            const BATCH_SIZE = 50;
            for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
              const batchRecords = validRecords.slice(i, i + BATCH_SIZE);
              
              for (const record of batchRecords) {
                try {
                  // Check for duplicate email
                  const existingLead = await this.prisma.lead.findFirst({
                    where: {
                      email: record.data.email,
                      deletedAt: null,
                    },
                  });

                  if (existingLead) {
                    errors.push({
                      row: record.rowIndex,
                      errors: ['Email already exists in the system'],
                      data: record.data,
                    });
                    failureCount++;

                    // Create import record with error
                    await this.prisma.leadImportRecord.create({
                      data: {
                        batchId: batch.id,
                        rowIndex: record.rowIndex,
                        status: 'FAILED',
                        errors: ['Email already exists in the system'],
                        rawData: record.data,
                      },
                    });
                  } else {
                    // Create the lead
                    const newLead = await this.prisma.lead.create({
                      data: {
                        ...record.data,
                        // Set default values for required fields not in CSV
                        status: record.data.status || 'NEW',
                        priority: record.data.priority || 'MEDIUM',
                      },
                    });

                    // Create successful import record
                    await this.prisma.leadImportRecord.create({
                      data: {
                        batchId: batch.id,
                        rowIndex: record.rowIndex,
                        leadId: newLead.id,
                        status: 'COMPLETED',
                        rawData: record.data,
                      },
                    });

                    successCount++;
                  }
                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                  errors.push({
                    row: record.rowIndex,
                    errors: [errorMessage],
                    data: record.data,
                  });
                  failureCount++;

                  // Create import record with error
                  await this.prisma.leadImportRecord.create({
                    data: {
                      batchId: batch.id,
                      rowIndex: record.rowIndex,
                      status: 'FAILED',
                      errors: [errorMessage],
                      rawData: record.data,
                    },
                  });
                }
              }
            }

            // Update batch with final results
            const finalStatus = failureCount === 0 ? 'COMPLETED' : 
                              successCount === 0 ? 'FAILED' : 'PARTIAL';

            await this.prisma.leadImportBatch.update({
              where: { id: batch.id },
              data: {
                successRows: successCount,
                failedRows: failureCount,
                status: finalStatus,
                errorDetails: errors.length > 0 ? { errors } as any : null,
              },
            });

            // Clean up the uploaded file
            try {
              fs.unlinkSync(filePath);
            } catch (cleanupError) {
              console.error('Error cleaning up file:', cleanupError);
            }

            resolve({
              batchId: batch.id,
              totalRows: records.length,
              successRows: successCount,
              failedRows: failureCount,
              errors,
            });
          } catch (error) {
            // Update batch with error status
            await this.prisma.leadImportBatch.update({
              where: { id: batch.id },
              data: {
                status: 'FAILED',
                errorDetails: { error: error instanceof Error ? error.message : 'Unknown error' },
              },
            });
            reject(error);
          }
        })
        .on('error', async (error: any) => {
          // Update batch with error status
          await this.prisma.leadImportBatch.update({
            where: { id: batch.id },
            data: {
              status: 'FAILED',
              errorDetails: { error: error.message },
            },
          });
          reject(error);
        });
    });
  }

  async generateCSVTemplate(): Promise<string> {
    const headers = [
      'firstName',
      'lastName', 
      'email',
      'phone',
      'company',
      'position',
      'status',
      'priority',
      'budget',
      'industry',
      'website',
      'address',
      'city',
      'state',
      'country',
      'zipCode',
      'linkedinProfile',
      'notes'
    ];

    const sampleData = [
      [
        'John',
        'Doe',
        'john.doe@example.com',
        '+1-555-0123',
        'Acme Corp',
        'Marketing Director',
        'NEW',
        'MEDIUM',
        '50000',
        'Technology',
        'https://acmecorp.com',
        '123 Main St',
        'New York',
        'NY',
        'USA',
        '10001',
        'https://linkedin.com/in/johndoe',
        'Interested in our enterprise solution'
      ]
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  async exportLeadsToCSV(filters?: {
    status?: string;
    assignedTo?: number;
    createdAfter?: Date;
    createdBefore?: Date;
  }): Promise<string> {
    const whereClause: any = { isActive: true, deletedAt: null };

    if (filters?.status) {
      whereClause.status = filters.status.toUpperCase();
    }

    if (filters?.assignedTo) {
      whereClause.assignedTo = filters.assignedTo;
    }

    if (filters?.createdAfter || filters?.createdBefore) {
      whereClause.createdAt = {};
      if (filters.createdAfter) {
        whereClause.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        whereClause.createdAt.lte = filters.createdBefore;
      }
    }

    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Position',
      'Status',
      'Priority',
      'Budget',
      'Industry',
      'Website',
      'Address',
      'City',
      'State',
      'Country',
      'Zip Code',
      'LinkedIn Profile',
      'Assigned To',
      'Notes',
      'Created At',
      'Updated At'
    ];

    const csvRows = leads.map(lead => [
      lead.id,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone || '',
      lead.company || '',
      lead.position || '',
      lead.status,
      lead.priority,
      lead.budget?.toString() || '',
      lead.industry || '',
      lead.website || '',
      lead.address || '',
      lead.city || '',
      lead.state || '',
      lead.country || '',
      lead.zipCode || '',
      lead.linkedinProfile || '',
      lead.assignedUser ? `${lead.assignedUser.firstName} ${lead.assignedUser.lastName}` : '',
      lead.notes || '',
      lead.createdAt.toISOString(),
      lead.updatedAt.toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  async getImportBatches(userId?: number, limit: number = 50): Promise<any[]> {
    const whereClause = userId ? { createdBy: userId } : {};

    return await this.prisma.leadImportBatch.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            records: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getImportBatchDetails(batchId: number): Promise<any> {
    return await this.prisma.leadImportBatch.findUnique({
      where: { id: batchId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        records: {
          include: {
            lead: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
          orderBy: { rowIndex: 'asc' },
        },
      },
    });
  }
}