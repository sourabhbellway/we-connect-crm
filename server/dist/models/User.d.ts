import { Model, Optional } from "sequelize";
interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    lastLogin?: Date;
    profilePicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "isActive" | "lastLogin" | "createdAt" | "updatedAt"> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    lastLogin?: Date;
    profilePicture?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    static hashPassword(password: string): Promise<string>;
    comparePassword(password: string): Promise<boolean>;
    get fullName(): string;
}
export default User;
//# sourceMappingURL=User.d.ts.map