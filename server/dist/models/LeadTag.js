"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class LeadTag extends sequelize_1.Model {
}
LeadTag.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    leadId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'leads',
            key: 'id',
        },
    },
    tagId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tags',
            key: 'id',
        },
    },
}, {
    sequelize: database_1.default,
    modelName: 'LeadTag',
    tableName: 'lead_tags',
    indexes: [
        {
            unique: true,
            fields: ['leadId', 'tagId'],
        },
    ],
});
exports.default = LeadTag;
//# sourceMappingURL=LeadTag.js.map