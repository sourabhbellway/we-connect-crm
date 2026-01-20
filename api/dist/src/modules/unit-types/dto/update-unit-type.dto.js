"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUnitTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_unit_type_dto_1 = require("./create-unit-type.dto");
class UpdateUnitTypeDto extends (0, mapped_types_1.PartialType)(create_unit_type_dto_1.CreateUnitTypeDto) {
}
exports.UpdateUnitTypeDto = UpdateUnitTypeDto;
//# sourceMappingURL=update-unit-type.dto.js.map