export declare class UpsertProposalTemplateDto {
    name: string;
    description?: string;
    content: string;
    isActive?: boolean;
    isDefault?: boolean;
    headerHtml?: string;
    footerHtml?: string;
    styles?: Record<string, unknown>;
    variables?: Record<string, unknown>;
    previewImage?: string;
    category?: string;
}
