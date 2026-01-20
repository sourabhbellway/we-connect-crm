"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCallLogDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_call_log_dto_1 = require("./create-call-log.dto");
class UpdateCallLogDto extends (0, mapped_types_1.PartialType)(create_call_log_dto_1.CreateCallLogDto) {
}
exports.UpdateCallLogDto = UpdateCallLogDto;
//# sourceMappingURL=update-call-log.dto.js.map