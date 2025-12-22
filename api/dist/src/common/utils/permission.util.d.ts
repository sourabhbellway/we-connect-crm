export declare function getRoleBasedWhereClause(userId: number, prisma: any, fields?: string[]): Promise<{
    OR?: undefined;
} | {
    OR: {
        [x: string]: {
            in: number[];
        };
    }[];
}>;
export declare function getAccessibleUserIds(userId: number, prisma: any): Promise<number[] | null>;
