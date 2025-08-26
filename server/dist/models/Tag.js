"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Tag extends sequelize_1.Model {
}
Tag.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [2, 50],
        },
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: '#3B82F6',
        validate: {
            is: /^#[0-9A-F]{6}$/i,
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Tag',
    tableName: 'tags',
});
exports.default = Tag;
//# sourceMappingURL=Tag.js.map