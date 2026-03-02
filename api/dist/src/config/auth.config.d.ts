declare const _default: (() => {
    refreshLifetimeDays: number;
    accessLifetimeHours: number;
    bootstrapAdmin: {
        enabled: boolean;
        email: string;
        password: string;
        roleName: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    refreshLifetimeDays: number;
    accessLifetimeHours: number;
    bootstrapAdmin: {
        enabled: boolean;
        email: string;
        password: string;
        roleName: string;
    };
}>;
export default _default;
