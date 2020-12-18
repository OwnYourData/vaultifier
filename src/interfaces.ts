export interface VaultCredentials {
  appKey?: string;
  appSecret?: string;
  authorizationCode?: string;
  scope?: string
}

export interface PrivateKeyCredentials {
  masterKey: string,
  nonce: string,
}

export interface VaultEncryptionSupport {
  supportsEncryption: boolean,
  supportsDecryption: boolean,
}

export interface VaultItem {
  // TODO: Do all have correct data type?
  id: number;
  content: any;
  createdAt: Date;
  updatedAt: Date;
  repoId: number;
  tableName: string;
  accessCount: number;
  isEncrypted: boolean;
  repoName?: string;
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

export interface PageQuery {
  page?: number,
  size?: number,
}

export interface VaultItemsQuery {
  schemaDri?: string;
  page?: PageQuery;
}

export interface VaultPostItem {
  content: any;
  mimeType: string;
  schemaDri?: string;
  repo?: string;
  dri?: string;
  id?: number;
}

export type VaultMeta = Omit<VaultItem, 'content' | 'isEncrypted'>;

export interface VaultMinMeta {
  id: number;
}

export interface VaultValue {
  id: number;
  content: any;
}

export interface VaultRepo {
  id: number,
  name: string,
}

export interface VaultSchema {
  dri: string;
  title?: string;
}

export enum OAuthType {
  AUTHORIZATION_CODE = 'authorization_code',
  CLIENT_CREDENTIALS = 'client_credentials',
}

export interface OAuthSupport {
  type: OAuthType,
}

export interface VaultSupport {
  repos: boolean,
  authentication: boolean,
  name?: string,
  scopes?: string[],
  oAuth?: OAuthSupport,
}

export interface MultiResponse<T> {
  content: T[];
  paging: Paging;
}

export interface Paging {
  current: number;
  totalPages: number;
  totalItems: number;
  pageItems: number;
}