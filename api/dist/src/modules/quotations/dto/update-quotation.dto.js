"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuotationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_quotation_dto_1 = require("./create-quotation.dto");
class UpdateQuotationDto extends (0, mapped_types_1.PartialType)(create_quotation_dto_1.CreateQuotationDto) {
}
exports.UpdateQuotationDto = UpdateQuotationDto;
//# sourceMappingURL=update-quotation.dto.js.map