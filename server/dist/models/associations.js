"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadTag = exports.LeadSource = exports.Tag = exports.Lead = exports.Permission = exports.Role = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Role_1 = __importDefault(require("./Role"));
exports.Role = Role_1.default;
const Permission_1 = __importDefault(require("./Permission"));
exports.Permission = Permission_1.default;
const Lead_1 = __importDefault(require("./Lead"));
exports.Lead = Lead_1.default;
const Tag_1 = __importDefault(require("./Tag"));
exports.Tag = Tag_1.default;
const LeadSource_1 = __importDefault(require("./LeadSource"));
exports.LeadSource = LeadSource_1.default;
const LeadTag_1 = __importDefault(require("./LeadTag"));
exports.LeadTag = LeadTag_1.default;
// User-Role Many-to-Many relationship
User_1.default.belongsToMany(Role_1.default, {
    through: 'user_roles',
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles',
});
Role_1.default.belongsToMany(User_1.default, {
    through: 'user_roles',
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users',
});
// Role-Permission Many-to-Many relationship
Role_1.default.belongsToMany(Permission_1.default, {
    through: 'role_permissions',
    foreignKey: 'roleId',
    otherKey: 'permissionId',
    as: 'permissions',
});
Permission_1.default.belongsToMany(Role_1.default, {
    through: 'role_permissions',
    foreignKey: 'permissionId',
    otherKey: 'roleId',
    as: 'roles',
});
// Lead-User relationship (Lead belongs to User)
Lead_1.default.belongsTo(User_1.default, {
    foreignKey: 'assignedTo',
    as: 'assignedUser',
});
User_1.default.hasMany(Lead_1.default, {
    foreignKey: 'assignedTo',
    as: 'assignedLeads',
});
// Lead-Tag Many-to-Many relationship
Lead_1.default.belongsToMany(Tag_1.default, {
    through: LeadTag_1.default,
    foreignKey: 'leadId',
    otherKey: 'tagId',
    as: 'tags',
});
Tag_1.default.belongsToMany(Lead_1.default, {
    through: LeadTag_1.default,
    foreignKey: 'tagId',
    otherKey: 'leadId',
    as: 'leads',
});
// Lead-Source relationship
Lead_1.default.belongsTo(LeadSource_1.default, {
    foreignKey: 'sourceId',
    as: 'source',
});
LeadSource_1.default.hasMany(Lead_1.default, {
    foreignKey: 'sourceId',
    as: 'leads',
});
//# sourceMappingURL=associations.js.map