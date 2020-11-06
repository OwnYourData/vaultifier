export interface VaultCredentials {
    appKey: string;
    appSecret: string;
}
export interface PrivateKeyCredentials {
    masterKey: string;
    nonce: string;
}
export interface VaultEncryptionSupport {
    supportsEncryption: boolean;
    supportsDecryption: boolean;
}
export interface VaultItem {
    id: number;
    content: any;
    createdAt: Date;
    updatedAt: Date;
    repoId: number;
    repoName: string;
    accessCount: number;
    isEncrypted: boolean;
    dri?: string;
    schemaDri?: string;
    mimeType?: string;
    merkleId?: string;
    oydHash?: string;
    oydSourcePileId?: string;
}
export interface VaultItemQuery {
    id?: number;
    dri?: string;
}
export interface VaultItemsQuery {
    schemaDri: string;
}
export interface VaultPostItem {
    content: any;
    dri: string;
    schemaDri: string;
    mimeType: string;
    repo?: string;
}
export declare type VaultMeta = Omit<VaultItem, 'content' | 'isEncrypted'>;
export interface VaultMinMeta {
    id: number;
}
export interface VaultValue {
    id: number;
    content: any;
}
export interface VaultRepo {
    id: number;
    name: string;
}
export interface VaultSchema {
    dri: string;
    title?: string;
}
