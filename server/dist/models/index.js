"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.LeadTag = exports.LeadSource = exports.Tag = exports.Lead = exports.Permission = exports.Role = exports.User = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.sequelize = database_1.default;
const associations_1 = require("./associations");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return associations_1.User; } });
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return associations_1.Role; } });
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return associations_1.Permission; } });
Object.defineProperty(exports, "Lead", { enumerable: true, get: function () { return associations_1.Lead; } });
Object.defineProperty(exports, "Tag", { enumerable: true, get: function () { return associations_1.Tag; } });
Object.defineProperty(exports, "LeadSource", { enumerable: true, get: function () { return associations_1.LeadSource; } });
Object.defineProperty(exports, "LeadTag", { enumerable: true, get: function () { return associations_1.LeadTag; } });
const models = {
    User: associations_1.User,
    Role: associations_1.Role,
    Permission: associations_1.Permission,
    Lead: associations_1.Lead,
    Tag: associations_1.Tag,
    LeadSource: associations_1.LeadSource,
    LeadTag: associations_1.LeadTag,
    sequelize: database_1.default,
};
exports.default = models;
//# sourceMappingURL=index.js.map