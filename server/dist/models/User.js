"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User extends sequelize_1.Model {
    // Hash password before saving
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, 12);
    }
    // Compare password
    async comparePassword(password) {
        return bcryptjs_1.default.compare(password, this.password);
    }
    // Get full name
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100],
        },
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
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    lastLogin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: "User",
    tableName: "users",
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await User.hashPassword(user.password);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed("password")) {
                user.password = await User.hashPassword(user.password);
            }
        },
    },
});
exports.default = User;
//# sourceMappingURL=User.js.map