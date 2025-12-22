import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvoiceTemplate } from '@prisma/client';

@Injectable()
export class InvoiceTemplatesService implements OnModuleInit {
    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedDefaults();
    }

    async seedDefaults() {
        const count = await this.prisma.invoiceTemplate.count();
        // For development/demo purposes, if we have the old templates, let's clear them to ensure we get the new ones.
        // In a real prod env, we might want to be more careful, but here we want to enforce the new requirement.
        if (count > 0) {
            const first = await this.prisma.invoiceTemplate.findFirst();
            if (first && first.designType !== 'job_card') {
                await this.prisma.invoiceTemplate.deleteMany({});
            }
        }

        const newCount = await this.prisma.invoiceTemplate.count();
        if (newCount === 0) {
            const defaults = [
                {
                    name: 'Professional Invoice',
                    description: 'Clean modern layout with logo left, invoice details right.',
                    designType: 'professional',
                    isDefault: true,
                    primaryColor: '#EA580C', // Orange
                    secondaryColor: '#FFF7ED', // Light Orange
                },
                {
                    name: 'Blue Theme',
                    description: 'Professional Job Card layout in Blue.',
                    designType: 'job_card',
                    isDefault: false,
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
                await this.prisma.invoiceTemplate.create({
                    data: {
                        ...template,
                        isActive: true,
                        headerContent: '',
                        footerContent: '',
                        termsAndConditions: 'Parking charges will be applied if the vehicle is not collected within 3 days after completion of repairs.',
                    },
                });
            }
            console.log('Seeded default invoice templates (Job Card Themes)');
        }
    }

    async findAll() {
        return this.prisma.invoiceTemplate.findMany({
            where: { deletedAt: null },
            orderBy: { id: 'asc' },
        });
    }

    async findOne(id: number) {
        return this.prisma.invoiceTemplate.findFirst({
            where: { id, deletedAt: null },
        });
    }

    async findDefault() {
        return this.prisma.invoiceTemplate.findFirst({
            where: { isDefault: true, deletedAt: null },
        });
    }

    async create(data: any) {
        // If setting as default, unset others
        if (data.isDefault) {
            await this.prisma.invoiceTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.invoiceTemplate.create({
            data,
        });
    }

    async update(id: number, data: any) {
        // If setting as default, unset others
        if (data.isDefault) {
            await this.prisma.invoiceTemplate.updateMany({
                where: { id: { not: id }, isDefault: true },
                data: { isDefault: false },
            });
        }

        return this.prisma.invoiceTemplate.update({
            where: { id },
            data,
        });
    }

    async delete(id: number) {
        // Soft delete
        return this.prisma.invoiceTemplate.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async setDefault(id: number) {
        await this.prisma.$transaction([
            this.prisma.invoiceTemplate.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            }),
            this.prisma.invoiceTemplate.update({
                where: { id },
                data: { isDefault: true },
            }),
        ]);
        return { success: true };
    }
}
