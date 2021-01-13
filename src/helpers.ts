import { decrypt, isEncrypted } from './crypto';
import { VaultItem, VaultMeta } from './interfaces';

export const parseVaultItemMeta = (data: any): VaultMeta => ({
  id: data.id,
  accessCount: data.access_count,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
  tableName: data.table_name,
  dri: data.dri,
  schemaDri: data.schema_dri,
  mimeType: data.mime_type,
  merkleId: data.merkle_id,
  oydHash: data.oyd_hash,
  oydSourcePileId: data.oyd_source_pile_id,
});

export const decryptOrNot = async (item: any, privateKey?: string): Promise<any> => {
  if (
    privateKey &&
    isEncrypted(item)
  ) {
    const decrypted = await decrypt(item, { cipher: privateKey });

    try {
      return JSON.parse(decrypted);
    } catch { /* the encrypted data is delivered as string */ }
  }

  return item;
}

export const parseVaultItem = async (data: any, privateKey?: string): Promise<VaultItem> => {
  if (typeof data === 'string') {
    try {
      // item usually contains JSON data, therefore we try to parse the string
      data = JSON.parse(data);
    } catch { /* */ }
  }

  const isContentEncrypted = isEncrypted(data.content);
  data.content = await decryptOrNot(data.content, privateKey);

  const item: VaultItem = {
    ...parseVaultItemMeta(data),
    isEncrypted: isContentEncrypted,
    content: data.content,
  };

  return item;
}