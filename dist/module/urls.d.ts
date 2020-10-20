import { VaultItemQuery, VaultItemsQuery } from './interfaces';
export declare class VaultifierUrls {
    private baseUrl;
    private repo;
    readonly token: string;
    readonly publicKey: string;
    readonly privateKey: string;
    readonly postValue: string;
    readonly postItem: string;
    readonly getRepos: string;
    constructor(baseUrl: string, repo: string);
    getItem: (query: VaultItemQuery) => string;
    getItems: (query?: VaultItemsQuery | undefined) => string;
    getValue: (query: VaultItemQuery) => string;
    deleteItem: (query: VaultItemQuery) => string;
    getSchemas: () => string;
}
