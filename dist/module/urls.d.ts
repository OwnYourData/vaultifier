import { VaultItemQuery, VaultItemsQuery } from './interfaces';
export declare class VaultifierUrls {
    private baseUrl;
    private repo;
    readonly info: string;
    readonly support: string;
    readonly token: string;
    readonly privateKey: string;
    readonly postValue: string;
    readonly postItem: string;
    readonly putItem: string;
    readonly getRepos: string;
    constructor(baseUrl: string, repo: string);
    getItem: (query: VaultItemQuery) => string;
    getMetaItems: (query?: VaultItemsQuery | undefined) => string;
    getItems: (query?: VaultItemsQuery | undefined) => string;
    getValue: (query: VaultItemQuery) => string;
    deleteItem: (query: VaultItemQuery) => string;
    getSchemas: () => string;
    resolveInstallCode: (code: string) => string;
    publicKey: () => string;
    getEncryptedPassword: (nonce: string) => string;
    setRepo: (repo: string) => string;
}
