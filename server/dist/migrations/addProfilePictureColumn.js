"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.addColumn('users', 'profilePicture', {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    });
}
async function down(queryInterface) {
    await queryInterface.removeColumn('users', 'profilePicture');
}
//# sourceMappingURL=addProfilePictureColumn.js.map