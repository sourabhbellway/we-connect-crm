import sequelize from '../config/database';
import { User, Role, Permission, Lead, Tag, LeadSource, LeadTag } from './associations';
declare const models: {
    User: typeof User;
    Role: typeof Role;
    Permission: typeof Permission;
    Lead: typeof Lead;
    Tag: typeof Tag;
    LeadSource: typeof LeadSource;
    LeadTag: typeof LeadTag;
    sequelize: import("sequelize").Sequelize;
};
export default models;
export { User, Role, Permission, Lead, Tag, LeadSource, LeadTag, sequelize };
//# sourceMappingURL=index.d.ts.map