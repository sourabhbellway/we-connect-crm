"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLeadValidation = exports.getLeadByIdValidation = exports.deleteLeadValidation = exports.updateLeadValidation = exports.createLeadValidation = void 0;
const express_validator_1 = require("express-validator");
exports.createLeadValidation = [
    (0, express_validator_1.body)("firstName")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First name can only contain letters and spaces")
        .custom((val) => {
        console.log("VALIDATING firstName:", val);
        return true;
    }),
    (0, express_validator_1.body)("lastName")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please provide a valid email address"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isLength({ min: 10, max: 20 })
        .withMessage("Phone number must be between 10 and 20 characters")
        .matches(/^\+?[0-9\s\-\(\)]+$/)
        .withMessage("Phone number contains invalid characters"),
    (0, express_validator_1.body)("company")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Company name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Company name contains invalid characters"),
    (0, express_validator_1.body)("position")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Position must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Position contains invalid characters"),
    (0, express_validator_1.body)("sourceId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Source ID must be a valid integer"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn([
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "closed",
        "lost",
    ])
        .withMessage("Invalid status value"),
    (0, express_validator_1.body)("notes")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Notes must not exceed 1000 characters"),
    (0, express_validator_1.body)("assignedTo")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Assigned user ID must be a valid integer"),
    (0, express_validator_1.body)("tags")
        .optional()
        .custom((value) => {
        if (value === undefined || value === null)
            return true;
        if (!Array.isArray(value))
            return false;
        return value.every((tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1);
    })
        .withMessage("Tags must be an array of positive integers"),
    // Enhanced fields validation
    (0, express_validator_1.body)("industry")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Industry must not exceed 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Industry contains invalid characters"),
    (0, express_validator_1.body)("website")
        .optional()
        .isURL()
        .withMessage("Website must be a valid URL"),
    (0, express_validator_1.body)("companySize")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Company size must be a positive integer"),
    (0, express_validator_1.body)("annualRevenue")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Annual revenue must be a positive number"),
    (0, express_validator_1.body)("leadScore")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Lead score must be between 0 and 100"),
    (0, express_validator_1.body)("address")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Address must not exceed 500 characters"),
    (0, express_validator_1.body)("country")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Country must not exceed 100 characters")
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage("Country can only contain letters, spaces and hyphens"),
    (0, express_validator_1.body)("state")
        .optional()
        .isLength({ max: 100 })
        .withMessage("State must not exceed 100 characters")
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage("State can only contain letters, spaces and hyphens"),
    (0, express_validator_1.body)("city")
        .optional()
        .isLength({ max: 100 })
        .withMessage("City must not exceed 100 characters")
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage("City can only contain letters, spaces and hyphens"),
    (0, express_validator_1.body)("zipCode")
        .optional()
        .isLength({ max: 20 })
        .withMessage("ZIP code must not exceed 20 characters")
        .matches(/^[A-Za-z0-9\s-]+$/)
        .withMessage("ZIP code contains invalid characters"),
    (0, express_validator_1.body)("linkedinProfile")
        .optional()
        .isURL()
        .withMessage("LinkedIn profile must be a valid URL"),
    (0, express_validator_1.body)("timezone")
        .optional()
        .isLength({ max: 50 })
        .withMessage("Timezone must not exceed 50 characters"),
    (0, express_validator_1.body)("preferredContactMethod")
        .optional()
        .isIn(["email", "phone", "sms", "whatsapp", "linkedin"])
        .withMessage("Invalid preferred contact method"),
    (0, express_validator_1.body)("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Invalid priority value"),
    (0, express_validator_1.body)("budget")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Budget must be a positive number"),
    (0, express_validator_1.body)("currency")
        .optional()
        .isIn([
        "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD",
        "HKD", "KRW", "MXN", "BRL", "RUB", "ZAR", "TRY", "NOK", "SEK", "DKK",
        "PLN", "CZK", "HUF", "ILS", "AED", "SAR", "THB", "MYR", "IDR", "PHP", "VND"
    ])
        .withMessage("Invalid currency code"),
    (0, express_validator_1.body)("lastContactedAt")
        .optional()
        .isISO8601()
        .withMessage("Last contacted date must be a valid ISO date"),
    (0, express_validator_1.body)("nextFollowUpAt")
        .optional()
        .isISO8601()
        .withMessage("Next follow-up date must be a valid ISO date"),
];
exports.updateLeadValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ min: 1 })
        .withMessage("Invalid lead ID"),
    (0, express_validator_1.body)("firstName")
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First name can only contain letters and spaces"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Last name can only contain letters and spaces"),
    (0, express_validator_1.body)("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email address"),
    (0, express_validator_1.body)("phone")
        .optional()
        .isLength({ min: 10, max: 20 })
        .withMessage("Phone number must be between 10 and 20 characters")
        .matches(/^\+?[0-9\s\-\(\)]+$/)
        .withMessage("Phone number contains invalid characters"),
    (0, express_validator_1.body)("company")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Company name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Company name contains invalid characters"),
    (0, express_validator_1.body)("position")
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage("Position must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Position contains invalid characters"),
    (0, express_validator_1.body)("sourceId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Source ID must be a valid integer"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn([
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "closed",
        "lost",
    ])
        .withMessage("Invalid status value"),
    (0, express_validator_1.body)("notes")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Notes must not exceed 1000 characters"),
    (0, express_validator_1.body)("assignedTo")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Assigned user ID must be a valid integer"),
    (0, express_validator_1.body)("tags")
        .optional()
        .custom((value) => {
        if (value === undefined || value === null)
            return true;
        if (!Array.isArray(value))
            return false;
        return value.every((tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1);
    })
        .withMessage("Tags must be an array of positive integers"),
    // Enhanced fields validation (same as create)
    (0, express_validator_1.body)("industry")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Industry must not exceed 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Industry contains invalid characters"),
    (0, express_validator_1.body)("website")
        .optional()
        .isURL()
        .withMessage("Website must be a valid URL"),
    (0, express_validator_1.body)("companySize")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Company size must be a positive integer"),
    (0, express_validator_1.body)("annualRevenue")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Annual revenue must be a positive number"),
    (0, express_validator_1.body)("leadScore")
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage("Lead score must be between 0 and 100"),
    (0, express_validator_1.body)("address")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Address must not exceed 500 characters"),
    (0, express_validator_1.body)("country")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Country must not exceed 100 characters")
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage("Country can only contain letters, spaces and hyphens"),
    (0, express_validator_1.body)("state")
        .optional()
        .isLength({ max: 100 })
        .withMessage("State must not exceed 100 characters")
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage("State can only contain letters, spaces and hyphens"),
    (0, express_validator_1.body)("city")
        .optional()
        .isLength({ max: 100 })
        .withMessage("City must not exceed 100 characters")
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage("City can only contain letters, spaces and hyphens"),
    (0, express_validator_1.body)("zipCode")
        .optional()
        .isLength({ max: 20 })
        .withMessage("ZIP code must not exceed 20 characters")
        .matches(/^[A-Za-z0-9\s-]+$/)
        .withMessage("ZIP code contains invalid characters"),
    (0, express_validator_1.body)("linkedinProfile")
        .optional()
        .isURL()
        .withMessage("LinkedIn profile must be a valid URL"),
    (0, express_validator_1.body)("timezone")
        .optional()
        .isLength({ max: 50 })
        .withMessage("Timezone must not exceed 50 characters"),
    (0, express_validator_1.body)("preferredContactMethod")
        .optional()
        .isIn(["email", "phone", "sms", "whatsapp", "linkedin"])
        .withMessage("Invalid preferred contact method"),
    (0, express_validator_1.body)("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Invalid priority value"),
    (0, express_validator_1.body)("budget")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Budget must be a positive number"),
    (0, express_validator_1.body)("currency")
        .optional()
        .isIn([
        "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD",
        "HKD", "KRW", "MXN", "BRL", "RUB", "ZAR", "TRY", "NOK", "SEK", "DKK",
        "PLN", "CZK", "HUF", "ILS", "AED", "SAR", "THB", "MYR", "IDR", "PHP", "VND"
    ])
        .withMessage("Invalid currency code"),
    (0, express_validator_1.body)("lastContactedAt")
        .optional()
        .isISO8601()
        .withMessage("Last contacted date must be a valid ISO date"),
    (0, express_validator_1.body)("nextFollowUpAt")
        .optional()
        .isISO8601()
        .withMessage("Next follow-up date must be a valid ISO date"),
];
exports.deleteLeadValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];
exports.getLeadByIdValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];
exports.convertLeadValidation = [
    (0, express_validator_1.param)("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
    (0, express_validator_1.body)("createContact")
        .optional()
        .isBoolean()
        .withMessage("createContact must be a boolean value"),
    (0, express_validator_1.body)("createCompany")
        .optional()
        .isBoolean()
        .withMessage("createCompany must be a boolean value"),
    (0, express_validator_1.body)("createDeal")
        .optional()
        .isBoolean()
        .withMessage("createDeal must be a boolean value"),
    // Contact data validation
    (0, express_validator_1.body)("contactData.firstName")
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 50 })
        .withMessage("Contact first name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Contact first name can only contain letters and spaces"),
    (0, express_validator_1.body)("contactData.lastName")
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 50 })
        .withMessage("Contact last name must be between 2 and 50 characters")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Contact last name can only contain letters and spaces"),
    (0, express_validator_1.body)("contactData.email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Contact email must be a valid email address"),
    (0, express_validator_1.body)("contactData.phone")
        .optional({ checkFalsy: true })
        .isLength({ min: 10, max: 20 })
        .withMessage("Contact phone must be between 10 and 20 characters")
        .matches(/^\+?[0-9\s\-\(\)]+$/)
        .withMessage("Contact phone contains invalid characters"),
    // Company data validation
    (0, express_validator_1.body)("companyData.name")
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 100 })
        .withMessage("Company name must be between 2 and 100 characters")
        .matches(/^[A-Za-z0-9\s&.,-]+$/)
        .withMessage("Company name contains invalid characters"),
    (0, express_validator_1.body)("companyData.domain")
        .optional({ checkFalsy: true })
        .matches(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/)
        .withMessage("Company domain must be a valid domain name"),
    // Deal data validation
    (0, express_validator_1.body)("dealData.title")
        .optional({ checkFalsy: true })
        .isLength({ min: 2, max: 200 })
        .withMessage("Deal title must be between 2 and 200 characters"),
    (0, express_validator_1.body)("dealData.value")
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 })
        .withMessage("Deal value must be a positive number"),
    (0, express_validator_1.body)("dealData.currency")
        .optional({ checkFalsy: true })
        .isIn([
        "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD"
    ])
        .withMessage("Invalid deal currency"),
    (0, express_validator_1.body)("dealData.status")
        .optional({ checkFalsy: true })
        .isIn(["DRAFT", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "draft", "proposal", "negotiation", "won", "lost"])
        .withMessage("Invalid deal status"),
    (0, express_validator_1.body)("dealData.probability")
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 100 })
        .withMessage("Deal probability must be between 0 and 100"),
    (0, express_validator_1.body)("dealData.expectedCloseDate")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage("Expected close date must be a valid ISO date"),
];
//# sourceMappingURL=leadValidators.js.map