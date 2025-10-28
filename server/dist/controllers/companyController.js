"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompanyActivity = exports.getCompanyActivities = exports.getCompanyStats = exports.deleteCompany = exports.updateCompany = exports.createCompany = exports.getCompanyById = exports.getCompanies = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const activityLogger_1 = require("../utils/activityLogger");
const getCompanies = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, assignedTo, industryId, status, size } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        const whereClause = { isActive: true, deletedAt: null };
        if (search) {
            const searchTerm = search;
            whereClause.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { domain: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        if (assignedTo) {
            whereClause.assignedTo = parseInt(assignedTo);
        }
        if (industryId) {
            whereClause.industryId = parseInt(industryId);
        }
        if (status) {
            whereClause.status = status;
        }
        if (size) {
            whereClause.companySize = size;
        }
        const [companies, totalCount] = await Promise.all([
            prisma_1.prisma.companies.findMany({
                where: whereClause,
                include: {
                    assignedUser: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    industry: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    parentCompany: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    contacts: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            position: true,
                        },
                        take: 5,
                        where: { isActive: true, deletedAt: null },
                    },
                    deals: {
                        select: {
                            id: true,
                            title: true,
                            value: true,
                            status: true,
                            probability: true,
                        },
                        where: { isActive: true, deletedAt: null },
                        take: 5,
                    },
                    _count: {
                        select: {
                            contacts: true,
                            deals: true,
                            leads: true,
                            subsidiaries: true,
                        },
                    },
                },
                orderBy: [{ createdAt: "desc" }],
                take: limitNum,
                skip: offset,
            }),
            prisma_1.prisma.companies.count({ where: whereClause }),
        ]);
        // Calculate total revenue for each company
        const companiesWithRevenue = await Promise.all(companies.map(async (company) => {
            const revenueData = await prisma_1.prisma.deal.aggregate({
                where: {
                    companyId: company.id,
                    status: "WON",
                    isActive: true,
                },
                _sum: { value: true },
            });
            return {
                ...company,
                totalRevenue: revenueData._sum.value || 0,
            };
        }));
        res.json({
            success: true,
            data: {
                companies: companiesWithRevenue,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalItems: totalCount,
                    itemsPerPage: limitNum,
                },
            },
        });
    }
    catch (error) {
        console.error("Get companies error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCompanies = getCompanies;
const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await prisma_1.prisma.companies.findUnique({
            where: { id: parseInt(id), deletedAt: null },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                industry: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                parentCompany: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                subsidiaries: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                    where: { isActive: true, deletedAt: null },
                },
                contacts: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        position: true,
                        department: true,
                        isActive: true,
                        lastContactedAt: true,
                    },
                    where: { isActive: true, deletedAt: null },
                    orderBy: { lastContactedAt: "desc" },
                },
                deals: {
                    select: {
                        id: true,
                        title: true,
                        value: true,
                        currency: true,
                        status: true,
                        probability: true,
                        expectedCloseDate: true,
                        actualCloseDate: true,
                        assignedUser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    where: { isActive: true, deletedAt: null },
                    orderBy: { createdAt: "desc" },
                },
                leads: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        status: true,
                        createdAt: true,
                    },
                    where: { isActive: true, deletedAt: null },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                activities: {
                    select: {
                        id: true,
                        type: true,
                        title: true,
                        description: true,
                        completedAt: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
                communications: {
                    select: {
                        id: true,
                        type: true,
                        subject: true,
                        content: true,
                        direction: true,
                        status: true,
                        sentAt: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
            },
        });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }
        // Calculate total revenue and deal statistics
        const [revenueStats, dealStats] = await Promise.all([
            prisma_1.prisma.deal.aggregate({
                where: {
                    companyId: company.id,
                    status: "WON",
                    isActive: true,
                },
                _sum: { value: true },
                _count: true,
            }),
            prisma_1.prisma.deal.groupBy({
                by: ['status'],
                where: {
                    companyId: company.id,
                    isActive: true,
                },
                _count: true,
                _sum: { value: true },
            }),
        ]);
        const companyWithStats = {
            ...company,
            totalRevenue: revenueStats._sum.value ? Number(revenueStats._sum.value) : 0,
            wonDealsCount: revenueStats._count || 0,
            dealStatsByStatus: dealStats.reduce((acc, stat) => {
                acc[stat.status] = {
                    count: stat._count,
                    value: stat._sum.value ? Number(stat._sum.value) : 0,
                };
                return acc;
            }, {}),
        };
        res.json({
            success: true,
            data: { company: companyWithStats },
        });
    }
    catch (error) {
        console.error("Get company by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCompanyById = getCompanyById;
const createCompany = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { name, domain, website, email, phone, alternatePhone, address, city, state, country, zipCode, description, employeeCount, annualRevenue, currency, foundedYear, linkedinProfile, twitterHandle, facebookPage, tags, notes, companySize, status, parentCompanyId, assignedTo, industryId, timezone, } = req.body;
        const createdBy = req.user?.id;
        // Check if company name already exists
        const nameExists = await prisma_1.prisma.companies.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                deletedAt: null
            },
        });
        if (nameExists) {
            return res.status(400).json({
                success: false,
                message: "Company name already exists",
            });
        }
        // Check domain uniqueness if provided
        if (domain) {
            const domainExists = await prisma_1.prisma.companies.findFirst({
                where: {
                    domain: { equals: domain, mode: 'insensitive' },
                    deletedAt: null
                },
            });
            if (domainExists) {
                return res.status(400).json({
                    success: false,
                    message: "Domain already exists for another company",
                });
            }
        }
        const company = await prisma_1.prisma.companies.create({
            data: {
                name,
                domain,
                website,
                email,
                phone,
                alternatePhone,
                address,
                city,
                state,
                country,
                zipCode,
                description,
                employeeCount,
                annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
                currency: currency || "USD",
                foundedYear: foundedYear ? parseInt(foundedYear) : null,
                linkedinProfile,
                twitterHandle,
                facebookPage,
                tags: tags || [],
                notes,
                companySize: companySize || "SMALL",
                status: status || "ACTIVE",
                parentCompanyId: parentCompanyId ? parseInt(parentCompanyId) : null,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                industryId: industryId ? parseInt(industryId) : null,
                timezone: timezone || "UTC",
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                industry: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                parentCompany: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        // Log activity
        await activityLogger_1.activityLoggers.companyCreated?.({
            id: company.id,
            name: company.name,
        }, createdBy);
        res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: { company },
        });
    }
    catch (error) {
        console.error("Create company error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createCompany = createCompany;
const updateCompany = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: errors.array(),
            });
        }
        const { id } = req.params;
        const { name, domain, website, email, phone, alternatePhone, address, city, state, country, zipCode, description, employeeCount, annualRevenue, currency, foundedYear, linkedinProfile, twitterHandle, facebookPage, tags, notes, companySize, status, parentCompanyId, assignedTo, industryId, timezone, } = req.body;
        // Check if company exists
        const existingCompany = await prisma_1.prisma.companies.findUnique({
            where: { id: parseInt(id), deletedAt: null },
        });
        if (!existingCompany) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }
        // Check name uniqueness if changed
        if (name && name.toLowerCase() !== existingCompany.name.toLowerCase()) {
            const nameExists = await prisma_1.prisma.companies.findFirst({
                where: {
                    name: { equals: name, mode: 'insensitive' },
                    NOT: { id: existingCompany.id },
                    deletedAt: null,
                },
            });
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: "Company name already exists",
                });
            }
        }
        // Check domain uniqueness if changed
        if (domain && domain.toLowerCase() !== existingCompany.domain?.toLowerCase()) {
            const domainExists = await prisma_1.prisma.companies.findFirst({
                where: {
                    domain: { equals: domain, mode: 'insensitive' },
                    NOT: { id: existingCompany.id },
                    deletedAt: null,
                },
            });
            if (domainExists) {
                return res.status(400).json({
                    success: false,
                    message: "Domain already exists for another company",
                });
            }
        }
        const company = await prisma_1.prisma.companies.update({
            where: { id: parseInt(id) },
            data: {
                name,
                domain,
                website,
                email,
                phone,
                alternatePhone,
                address,
                city,
                state,
                country,
                zipCode,
                description,
                employeeCount,
                annualRevenue: annualRevenue ? parseFloat(annualRevenue) : null,
                currency: currency || "USD",
                foundedYear: foundedYear ? parseInt(foundedYear) : null,
                linkedinProfile,
                twitterHandle,
                facebookPage,
                tags: tags || [],
                notes,
                companySize,
                status,
                parentCompanyId: parentCompanyId ? parseInt(parentCompanyId) : null,
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                industryId: industryId ? parseInt(industryId) : null,
                timezone: timezone || "UTC",
                slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : existingCompany.slug,
                lastContactedAt: new Date(),
            },
            include: {
                assignedUser: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                industry: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                parentCompany: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: "Company updated successfully",
            data: { company },
        });
    }
    catch (error) {
        console.error("Update company error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateCompany = updateCompany;
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if company exists
        const existingCompany = await prisma_1.prisma.companies.findUnique({
            where: { id: parseInt(id) },
        });
        if (!existingCompany) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }
        await prisma_1.prisma.companies.update({
            where: { id: parseInt(id) },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
        res.json({
            success: true,
            message: "Company deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete company error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteCompany = deleteCompany;
const getCompanyStats = async (req, res) => {
    try {
        const [totalCompanies, activeCompanies, companiesWithDeals, totalRevenue, companiesThisMonth, companiesBySize, companiesByStatus, topCompaniesByRevenue,] = await Promise.all([
            prisma_1.prisma.companies.count({ where: { isActive: true, deletedAt: null } }),
            prisma_1.prisma.companies.count({ where: { isActive: true, status: "ACTIVE", deletedAt: null } }),
            prisma_1.prisma.companies.count({
                where: {
                    isActive: true,
                    deletedAt: null,
                    deals: {
                        some: {
                            isActive: true,
                            status: { not: "LOST" },
                        },
                    },
                },
            }),
            prisma_1.prisma.deal.aggregate({
                where: {
                    isActive: true,
                    status: "WON",
                    companies: {
                        isActive: true,
                        deletedAt: null,
                    },
                },
                _sum: { value: true },
            }),
            prisma_1.prisma.companies.count({
                where: {
                    isActive: true,
                    deletedAt: null,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma_1.prisma.companies.groupBy({
                by: ['companySize'],
                where: { isActive: true, deletedAt: null },
                _count: true,
            }),
            prisma_1.prisma.companies.groupBy({
                by: ['status'],
                where: { isActive: true, deletedAt: null },
                _count: true,
            }),
            // Top companies by revenue
            prisma_1.prisma.$queryRaw `
        SELECT c.id, c.name, COALESCE(SUM(d.value), 0) as total_revenue
        FROM companies c
        LEFT JOIN deals d ON c.id = d."companyId" AND d.status = 'WON' AND d."isActive" = true
        WHERE c."isActive" = true AND c."deletedAt" IS NULL
        GROUP BY c.id, c.name
        ORDER BY total_revenue DESC
        LIMIT 10
      `,
        ]);
        res.json({
            success: true,
            data: {
                totalCompanies,
                activeCompanies,
                companiesWithDeals,
                totalRevenue: totalRevenue._sum.value || 0,
                companiesThisMonth,
                companiesBySize: companiesBySize.reduce((acc, item) => {
                    acc[item.companySize || 'UNKNOWN'] = item._count;
                    return acc;
                }, {}),
                companiesByStatus: companiesByStatus.reduce((acc, item) => {
                    acc[item.status || 'UNKNOWN'] = item._count;
                    return acc;
                }, {}),
                topCompaniesByRevenue,
            },
        });
    }
    catch (error) {
        console.error("Get company stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCompanyStats = getCompanyStats;
const getCompanyActivities = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20, type } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const offset = (pageNum - 1) * limitNum;
        const whereClause = { companyId: parseInt(id) };
        if (type) {
            whereClause.type = type;
        }
        const [activities, totalCount] = await Promise.all([
            prisma_1.prisma.companyActivity.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: limitNum,
                skip: offset,
            }),
            prisma_1.prisma.companyActivity.count({ where: whereClause }),
        ]);
        res.json({
            success: true,
            data: {
                activities,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalItems: totalCount,
                    itemsPerPage: limitNum,
                },
            },
        });
    }
    catch (error) {
        console.error("Get company activities error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCompanyActivities = getCompanyActivities;
const createCompanyActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, description, duration, outcome, scheduledAt, metadata } = req.body;
        const userId = req.user?.id;
        const activity = await prisma_1.prisma.companyActivity.create({
            data: {
                companyId: parseInt(id),
                userId,
                type,
                title,
                description,
                duration: duration ? parseInt(duration) : null,
                outcome,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                metadata,
                isCompleted: scheduledAt ? false : true,
                completedAt: scheduledAt ? null : new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: "Company activity created successfully",
            data: { activity },
        });
    }
    catch (error) {
        console.error("Create company activity error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createCompanyActivity = createCompanyActivity;
//# sourceMappingURL=companyController.js.map