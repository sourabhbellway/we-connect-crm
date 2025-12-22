export declare class UpsertIntegrationDto {
    name: string;
    displayName: string;
    description?: string;
    isActive?: boolean;
    apiEndpoint: string;
    authType?: string;
    config?: Record<string, unknown>;
}
