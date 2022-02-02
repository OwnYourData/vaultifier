export interface i18nObject {
  [languageCode: string]: string,
}

export interface VaultCredentials {
  appKey?: string;
  appSecret?: string;

  clientId?: string;
  authorizationCode?: string;

  // additional property for external identity providers
  state?: string;

  scope?: string
}

export interface VaultE2EKeys {
  publicKey?: string;
  privateKey?: string;
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
  tableName: string;
  isEncrypted: boolean;
  accessCount?: number;
  dri?: string;
  schemaDri?: string;
  mimeType?: string;
  merkleId?: string;
  oydHash?: string;
  oydSourcePileId?: string;
  // Raw presentation of a vault item
  // *IMPORTANT*: Content is already decrypted (if applicable)!
  raw: any;
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
  tableId?: string;
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
  identifier: string,
}

export interface VaultTable {
  id: string,
}

export interface VaultSchema {
  dri: string;
  title?: string;
}

export interface VaultRelation {
  id: number,
  upstream: number[],
  downstream: number[],
}

export enum OAuthType {
  AUTHORIZATION_CODE = 'authorization_code',
  CLIENT_CREDENTIALS = 'client_credentials',
}

export interface OAuthSupport {
  type: OAuthType,
}

export interface OAuthIdentityProvider {
  authority: string,
  clientId: string,
  scope: string,
  responseType: string,
  redirectUrl: string,
  title: i18nObject,
  imageUrl: string,
  applicationId: string,
}

export interface VaultSupport {
  repos: boolean,
  authentication: boolean,
  scopes?: string[],
  oAuth?: (OAuthSupport | OAuthIdentityProvider)[],
}

export interface VaultInfo {
  name?: string;
  description?: string;
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