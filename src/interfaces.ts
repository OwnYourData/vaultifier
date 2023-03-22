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

export interface VaultMetaObject {
  schema?: string;
}

export interface VaultPostItem {
  id?: number;
  meta?: VaultMetaObject;
  data: any;
}

export interface VaultItem {
  id: number;
  meta: VaultMetaObject;
  data: any;
  dri?: string;
  isEncrypted: boolean;

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
  schema?: string;
  page?: PageQuery;
}

export type VaultMeta = Omit<VaultItem, 'data' | 'isEncrypted'>;

export interface VaultMinMeta {
  id: number;
  // Raw presentation of vault meta
  raw: any;
}

export interface VaultData {
  id: number;
  data: any;
}

export interface VaultRepo {
  id: number,
  name: string,
  identifier: string,
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
  items: T[];
  paging: Paging;
}

export interface Paging {
  current: number;
  totalPages: number;
  totalItems: number;
  pageItems: number;
}