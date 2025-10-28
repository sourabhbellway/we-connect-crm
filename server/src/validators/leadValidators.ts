import { body, param } from "express-validator";
export const createLeadValidation = [
  body("firstName")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name can only contain letters and spaces")
    .custom((val) => {
      console.log("VALIDATING firstName:", val); 
      return true;
    }),

  body("lastName")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters")
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage("Phone number contains invalid characters"),

  body("company")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Company name contains invalid characters"),

  body("position")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Position contains invalid characters"),

  body("sourceId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Source ID must be a valid integer"),

  body("status")
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

  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),

  body("assignedTo")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Assigned user ID must be a valid integer"),

  body("tags")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) return false;
      return value.every(
        (tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1
      );
    })
    .withMessage("Tags must be an array of positive integers"),

  // Enhanced fields validation
  body("industry")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Industry must not exceed 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Industry contains invalid characters"),

  body("website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),

  body("companySize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Company size must be a positive integer"),

  body("annualRevenue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Annual revenue must be a positive number"),

  body("leadScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Lead score must be between 0 and 100"),

  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),

  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country must not exceed 100 characters")
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage("Country can only contain letters, spaces and hyphens"),

  body("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State must not exceed 100 characters")
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage("State can only contain letters, spaces and hyphens"),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters")
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage("City can only contain letters, spaces and hyphens"),

  body("zipCode")
    .optional()
    .isLength({ max: 20 })
    .withMessage("ZIP code must not exceed 20 characters")
    .matches(/^[A-Za-z0-9\s-]+$/)
    .withMessage("ZIP code contains invalid characters"),

  body("linkedinProfile")
    .optional()
    .isURL()
    .withMessage("LinkedIn profile must be a valid URL"),

  body("timezone")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Timezone must not exceed 50 characters"),

  body("preferredContactMethod")
    .optional()
    .isIn(["email", "phone", "sms", "whatsapp", "linkedin"])
    .withMessage("Invalid preferred contact method"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority value"),

  body("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget must be a positive number"),

  body("currency")
    .optional()
    .isIn([
      "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD",
      "HKD", "KRW", "MXN", "BRL", "RUB", "ZAR", "TRY", "NOK", "SEK", "DKK",
      "PLN", "CZK", "HUF", "ILS", "AED", "SAR", "THB", "MYR", "IDR", "PHP", "VND"
    ])
    .withMessage("Invalid currency code"),

  body("lastContactedAt")
    .optional()
    .isISO8601()
    .withMessage("Last contacted date must be a valid ISO date"),

  body("nextFollowUpAt")
    .optional()
    .isISO8601()
    .withMessage("Next follow-up date must be a valid ISO date"),
];

export const updateLeadValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid lead ID"),

  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .optional()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters")
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage("Phone number contains invalid characters"),

  body("company")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Company name contains invalid characters"),

  body("position")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Position must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Position contains invalid characters"),

  body("sourceId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Source ID must be a valid integer"),

  body("status")
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

  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),

  body("assignedTo")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Assigned user ID must be a valid integer"),

  body("tags")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) return false;
      return value.every(
        (tagId) => Number.isInteger(Number(tagId)) && Number(tagId) >= 1
      );
    })
    .withMessage("Tags must be an array of positive integers"),

  // Enhanced fields validation (same as create)
  body("industry")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Industry must not exceed 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Industry contains invalid characters"),

  body("website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),

  body("companySize")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Company size must be a positive integer"),

  body("annualRevenue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Annual revenue must be a positive number"),

  body("leadScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Lead score must be between 0 and 100"),

  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),

  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Country must not exceed 100 characters")
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage("Country can only contain letters, spaces and hyphens"),

  body("state")
    .optional()
    .isLength({ max: 100 })
    .withMessage("State must not exceed 100 characters")
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage("State can only contain letters, spaces and hyphens"),

  body("city")
    .optional()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters")
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage("City can only contain letters, spaces and hyphens"),

  body("zipCode")
    .optional()
    .isLength({ max: 20 })
    .withMessage("ZIP code must not exceed 20 characters")
    .matches(/^[A-Za-z0-9\s-]+$/)
    .withMessage("ZIP code contains invalid characters"),

  body("linkedinProfile")
    .optional()
    .isURL()
    .withMessage("LinkedIn profile must be a valid URL"),

  body("timezone")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Timezone must not exceed 50 characters"),

  body("preferredContactMethod")
    .optional()
    .isIn(["email", "phone", "sms", "whatsapp", "linkedin"])
    .withMessage("Invalid preferred contact method"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority value"),

  body("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget must be a positive number"),

  body("currency")
    .optional()
    .isIn([
      "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD",
      "HKD", "KRW", "MXN", "BRL", "RUB", "ZAR", "TRY", "NOK", "SEK", "DKK",
      "PLN", "CZK", "HUF", "ILS", "AED", "SAR", "THB", "MYR", "IDR", "PHP", "VND"
    ])
    .withMessage("Invalid currency code"),

  body("lastContactedAt")
    .optional()
    .isISO8601()
    .withMessage("Last contacted date must be a valid ISO date"),

  body("nextFollowUpAt")
    .optional()
    .isISO8601()
    .withMessage("Next follow-up date must be a valid ISO date"),
];

export const deleteLeadValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];

export const getLeadByIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
];

export const convertLeadValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
  
  body("createContact")
    .optional()
    .isBoolean()
    .withMessage("createContact must be a boolean value"),
    
  body("createCompany")
    .optional()
    .isBoolean()
    .withMessage("createCompany must be a boolean value"),
    
  body("createDeal")
    .optional()
    .isBoolean()
    .withMessage("createDeal must be a boolean value"),

  // Contact data validation
  body("contactData.firstName")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 50 })
    .withMessage("Contact first name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Contact first name can only contain letters and spaces"),

  body("contactData.lastName")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 50 })
    .withMessage("Contact last name must be between 2 and 50 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Contact last name can only contain letters and spaces"),

  body("contactData.email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Contact email must be a valid email address"),

  body("contactData.phone")
    .optional({ checkFalsy: true })
    .isLength({ min: 10, max: 20 })
    .withMessage("Contact phone must be between 10 and 20 characters")
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage("Contact phone contains invalid characters"),

  // Company data validation
  body("companyData.name")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s&.,-]+$/)
    .withMessage("Company name contains invalid characters"),

  body("companyData.domain")
    .optional({ checkFalsy: true })
    .matches(/^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/)
    .withMessage("Company domain must be a valid domain name"),

  // Deal data validation
  body("dealData.title")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 200 })
    .withMessage("Deal title must be between 2 and 200 characters"),

  body("dealData.value")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Deal value must be a positive number"),

  body("dealData.currency")
    .optional({ checkFalsy: true })
    .isIn([
      "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "SGD"
    ])
    .withMessage("Invalid deal currency"),

  body("dealData.status")
    .optional({ checkFalsy: true })
    .isIn(["DRAFT", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "draft", "proposal", "negotiation", "won", "lost"])
    .withMessage("Invalid deal status"),

  body("dealData.probability")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage("Deal probability must be between 0 and 100"),

  body("dealData.expectedCloseDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Expected close date must be a valid ISO date"),
];
