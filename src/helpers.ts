import { VaultMeta } from './interfaces';

export const parseVaultItemMeta = (data: any): VaultMeta => ({
  id: data.id,
  accessCount: data.access_count,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  repoId: data.repo_id,
  repoName: data.repo_name,
  tableName: data.table_name,
  dri: data.dri,
  schemaDri: data.schema_dri,
  mimeType: data.mime_type,
  merkleId: data.merkle_id,
  oydHash: data.oyd_hash,
  oydSourcePileId: data.oyd_source_pile_id,
});
