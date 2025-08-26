"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Lead extends sequelize_1.Model {
    // Get full name
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
Lead.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 50],
        },
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [10, 20],
        },
    },
    company: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [2, 100],
        },
    },
    position: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [2, 100],
        },
    },
    sourceId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'lead_sources',
            key: 'id',
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'),
        allowNull: false,
        defaultValue: 'new',
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    assignedTo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Lead',
    tableName: 'leads',
});
exports.default = Lead;
//# sourceMappingURL=Lead.js.map