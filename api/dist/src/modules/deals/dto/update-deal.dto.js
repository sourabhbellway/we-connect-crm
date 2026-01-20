"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDealDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_deal_dto_1 = require("./create-deal.dto");
class UpdateDealDto extends (0, mapped_types_1.PartialType)(create_deal_dto_1.CreateDealDto) {
}
exports.UpdateDealDto = UpdateDealDto;
//# sourceMappingURL=update-deal.dto.js.map