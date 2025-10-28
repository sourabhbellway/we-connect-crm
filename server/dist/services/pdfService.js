"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFService {
    getCurrencySymbol(currency) {
        const symbols = {
            USD: "$",
            EUR: "€",
            GBP: "£",
            INR: "₹",
            AUD: "A$",
            CAD: "C$",
            JPY: "¥",
            CNY: "¥",
        };
        return symbols[currency] || currency;
    }
    formatCurrency(amount, currency) {
        const symbol = this.getCurrencySymbol(currency);
        return `${symbol}${Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
    formatDate(date) {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
    async generateQuotationPDF(data) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    size: "A4",
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                });
                const buffers = [];
                doc.on("data", buffers.push.bind(buffers));
                doc.on("end", () => {
                    const pdfBuffer = Buffer.concat(buffers);
                    resolve(pdfBuffer);
                });
                doc.on("error", reject);
                const pageWidth = doc.page.width;
                const pageHeight = doc.page.height;
                const leftMargin = 50;
                const rightMargin = pageWidth - 50;
                const contentWidth = rightMargin - leftMargin;
                // Header Section with Modern Design
                doc.rect(0, 0, pageWidth, 200).fill("#1a56db");
                // Company Name
                doc
                    .fontSize(28)
                    .fillColor("#ffffff")
                    .font("Helvetica-Bold")
                    .text(data.company.companyName, leftMargin, 60, { width: contentWidth });
                // Quotation Number - Top Right
                doc
                    .fontSize(16)
                    .fillColor("#ffffff")
                    .font("Helvetica-Bold")
                    .text("QUOTATION", rightMargin - 150, 60, { width: 150, align: "right" });
                doc
                    .fontSize(14)
                    .fillColor("#e0e7ff")
                    .font("Helvetica")
                    .text(data.quotation.quotationNumber, rightMargin - 150, 85, {
                    width: 150,
                    align: "right",
                });
                // Company Details
                let yPos = 120;
                doc.fontSize(10).fillColor("#e0e7ff").font("Helvetica");
                if (data.company.companyAddress) {
                    doc.text(data.company.companyAddress, leftMargin, yPos);
                    yPos += 15;
                }
                if (data.company.companyEmail) {
                    doc.text(`Email: ${data.company.companyEmail}`, leftMargin, yPos);
                    yPos += 15;
                }
                if (data.company.companyPhone) {
                    doc.text(`Phone: ${data.company.companyPhone}`, leftMargin, yPos);
                    yPos += 15;
                }
                if (data.company.companyWebsite) {
                    doc.text(`Web: ${data.company.companyWebsite}`, leftMargin, yPos);
                }
                // Customer Details Section
                yPos = 230;
                doc
                    .fontSize(12)
                    .fillColor("#1f2937")
                    .font("Helvetica-Bold")
                    .text("BILL TO:", leftMargin, yPos);
                yPos += 25;
                doc
                    .fontSize(14)
                    .fillColor("#111827")
                    .font("Helvetica-Bold")
                    .text(data.customer.fullName, leftMargin, yPos);
                yPos += 20;
                doc.fontSize(10).fillColor("#4b5563").font("Helvetica");
                if (data.customer.company) {
                    doc.text(data.customer.company, leftMargin, yPos);
                    yPos += 15;
                }
                if (data.customer.address) {
                    doc.text(data.customer.address, leftMargin, yPos);
                    yPos += 15;
                }
                const location = [
                    data.customer.city,
                    data.customer.state,
                    data.customer.zipCode,
                    data.customer.country,
                ]
                    .filter(Boolean)
                    .join(", ");
                if (location) {
                    doc.text(location, leftMargin, yPos);
                    yPos += 15;
                }
                if (data.customer.email) {
                    doc.text(`Email: ${data.customer.email}`, leftMargin, yPos);
                    yPos += 15;
                }
                if (data.customer.phone) {
                    doc.text(`Phone: ${data.customer.phone}`, leftMargin, yPos);
                    yPos += 15;
                }
                // Dates Section - Right Side
                const datesX = rightMargin - 200;
                doc
                    .fontSize(10)
                    .fillColor("#6b7280")
                    .font("Helvetica")
                    .text("Date Issued:", datesX, 230);
                doc
                    .fillColor("#111827")
                    .font("Helvetica-Bold")
                    .text(this.formatDate(data.quotation.createdAt), datesX + 80, 230);
                if (data.quotation.validUntil) {
                    doc
                        .fillColor("#6b7280")
                        .font("Helvetica")
                        .text("Valid Until:", datesX, 250);
                    doc
                        .fillColor("#111827")
                        .font("Helvetica-Bold")
                        .text(this.formatDate(data.quotation.validUntil), datesX + 80, 250);
                }
                // Quotation Title
                yPos += 30;
                if (data.quotation.title) {
                    doc
                        .fontSize(16)
                        .fillColor("#1a56db")
                        .font("Helvetica-Bold")
                        .text(data.quotation.title, leftMargin, yPos, { width: contentWidth });
                    yPos += 25;
                }
                if (data.quotation.description) {
                    doc
                        .fontSize(10)
                        .fillColor("#4b5563")
                        .font("Helvetica")
                        .text(data.quotation.description, leftMargin, yPos, { width: contentWidth });
                    yPos += 30;
                }
                // Items Table
                yPos += 20;
                const tableTop = yPos;
                const tableHeaders = ["Item", "Qty", "Unit Price", "Tax", "Discount", "Total"];
                const columnWidths = [220, 50, 80, 60, 60, 80];
                let xPos = leftMargin;
                // Table Header
                doc.rect(leftMargin, tableTop, contentWidth, 30).fill("#f3f4f6");
                doc.fontSize(10).fillColor("#374151").font("Helvetica-Bold");
                tableHeaders.forEach((header, i) => {
                    const align = i === 0 ? "left" : "right";
                    doc.text(header, xPos + 5, tableTop + 10, {
                        width: columnWidths[i] - 10,
                        align,
                    });
                    xPos += columnWidths[i];
                });
                yPos = tableTop + 35;
                // Table Rows
                doc.fontSize(9).font("Helvetica");
                data.items.forEach((item, index) => {
                    // Check if we need a new page
                    if (yPos > pageHeight - 200) {
                        doc.addPage();
                        yPos = 50;
                    }
                    // Alternating row colors
                    if (index % 2 === 0) {
                        doc.rect(leftMargin, yPos - 5, contentWidth, 30).fill("#fafafa");
                    }
                    xPos = leftMargin;
                    // Item name and description
                    doc.fillColor("#111827").font("Helvetica-Bold");
                    doc.text(item.name, xPos + 5, yPos, { width: columnWidths[0] - 10 });
                    if (item.description) {
                        doc
                            .fontSize(8)
                            .fillColor("#6b7280")
                            .font("Helvetica")
                            .text(item.description, xPos + 5, yPos + 12, {
                            width: columnWidths[0] - 10,
                        });
                    }
                    xPos += columnWidths[0];
                    doc.fontSize(9).fillColor("#374151").font("Helvetica");
                    // Quantity
                    doc.text(`${item.quantity} ${item.unit || ""}`, xPos + 5, yPos, { width: columnWidths[1] - 10, align: "right" });
                    xPos += columnWidths[1];
                    // Unit Price
                    doc.text(this.formatCurrency(item.unitPrice, data.quotation.currency), xPos + 5, yPos, { width: columnWidths[2] - 10, align: "right" });
                    xPos += columnWidths[2];
                    // Tax
                    doc.text(`${item.taxRate}%`, xPos + 5, yPos, {
                        width: columnWidths[3] - 10,
                        align: "right",
                    });
                    xPos += columnWidths[3];
                    // Discount
                    doc.text(`${item.discountRate}%`, xPos + 5, yPos, {
                        width: columnWidths[4] - 10,
                        align: "right",
                    });
                    xPos += columnWidths[4];
                    // Total
                    doc
                        .fillColor("#111827")
                        .font("Helvetica-Bold")
                        .text(this.formatCurrency(item.totalAmount, data.quotation.currency), xPos + 5, yPos, { width: columnWidths[5] - 10, align: "right" });
                    yPos += 35;
                });
                // Totals Section
                yPos += 20;
                const totalsX = rightMargin - 250;
                // Subtotal
                doc
                    .fontSize(10)
                    .fillColor("#6b7280")
                    .font("Helvetica")
                    .text("Subtotal:", totalsX, yPos);
                doc
                    .fillColor("#111827")
                    .font("Helvetica-Bold")
                    .text(this.formatCurrency(data.quotation.subtotal, data.quotation.currency), totalsX + 150, yPos, { width: 100, align: "right" });
                yPos += 20;
                // Discount
                if (data.quotation.discountAmount > 0) {
                    doc.fillColor("#6b7280").font("Helvetica").text("Discount:", totalsX, yPos);
                    doc
                        .fillColor("#111827")
                        .font("Helvetica-Bold")
                        .text(`-${this.formatCurrency(data.quotation.discountAmount, data.quotation.currency)}`, totalsX + 150, yPos, { width: 100, align: "right" });
                    yPos += 20;
                }
                // Tax
                if (data.quotation.taxAmount > 0) {
                    doc.fillColor("#6b7280").font("Helvetica").text("Tax:", totalsX, yPos);
                    doc
                        .fillColor("#111827")
                        .font("Helvetica-Bold")
                        .text(this.formatCurrency(data.quotation.taxAmount, data.quotation.currency), totalsX + 150, yPos, { width: 100, align: "right" });
                    yPos += 20;
                }
                // Total
                doc.rect(totalsX, yPos - 5, 250, 35).fill("#1a56db");
                doc
                    .fontSize(14)
                    .fillColor("#ffffff")
                    .font("Helvetica-Bold")
                    .text("TOTAL:", totalsX + 10, yPos + 7);
                doc
                    .fontSize(16)
                    .text(this.formatCurrency(data.quotation.totalAmount, data.quotation.currency), totalsX + 150, yPos + 5, { width: 90, align: "right" });
                yPos += 60;
                // Notes
                if (data.quotation.notes) {
                    if (yPos > pageHeight - 150) {
                        doc.addPage();
                        yPos = 50;
                    }
                    doc
                        .fontSize(12)
                        .fillColor("#1f2937")
                        .font("Helvetica-Bold")
                        .text("Notes:", leftMargin, yPos);
                    yPos += 20;
                    doc
                        .fontSize(10)
                        .fillColor("#4b5563")
                        .font("Helvetica")
                        .text(data.quotation.notes, leftMargin, yPos, { width: contentWidth });
                    yPos += 40;
                }
                // Terms & Conditions
                if (data.quotation.terms) {
                    if (yPos > pageHeight - 150) {
                        doc.addPage();
                        yPos = 50;
                    }
                    doc
                        .fontSize(12)
                        .fillColor("#1f2937")
                        .font("Helvetica-Bold")
                        .text("Terms & Conditions:", leftMargin, yPos);
                    yPos += 20;
                    doc
                        .fontSize(9)
                        .fillColor("#6b7280")
                        .font("Helvetica")
                        .text(data.quotation.terms, leftMargin, yPos, { width: contentWidth });
                }
                // Footer
                const footerY = pageHeight - 40;
                doc
                    .fontSize(8)
                    .fillColor("#9ca3af")
                    .font("Helvetica")
                    .text(`Generated on ${this.formatDate(new Date())} | ${data.company.companyName}`, leftMargin, footerY, { width: contentWidth, align: "center" });
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.PDFService = PDFService;
exports.default = new PDFService();
//# sourceMappingURL=pdfService.js.map