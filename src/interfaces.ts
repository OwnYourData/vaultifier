export interface VaultCredentials {
  appKey: string;
  appSecret: string;
}

export interface VaultItem {
  // TODO: Do all have correct data type?
  id: number;
  content: any;
  createdAt: Date;
  updatedAt: Date;
  repoId: number;
  repoName: string;
  accessCount: number;
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

export interface VaultMinMeta {
  id: number;
}

export interface VaultValue {
  id: number;
  content: any;
}

export interface VaultSchema {
  dri: string;
}
