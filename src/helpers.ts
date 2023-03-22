import { NetworkResponse } from './communicator';
import { decrypt, isEncrypted } from './crypto';
import { Paging, VaultItem, VaultMeta, VaultMinMeta } from './interfaces';

export const parseVaultItemMeta = (data: any): VaultMeta => ({
  id: data.id,
  dri: data.dri,
  // we always provide a fallback value for meta
  meta: data.meta ?? {},
  // raw data
  raw: data,
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

  const isContentEncrypted = isEncrypted(data.data);
  data.data = await decryptOrNot(data.data, privateKey);

  const item: VaultItem = {
    ...parseVaultItemMeta(data),
    isEncrypted: isContentEncrypted,
    data: data.data,
  };

  return item;
}

export const parsePostResult = (response: NetworkResponse): VaultMinMeta => {
  const { data } = response;

  return {
    id: data.id,
    raw: data,
  };
}

const parsePagingHeaderValue = (value: string | number) => {
  return typeof value === 'string' ? parseInt(value) : value;
}

export const getPaging = (response: NetworkResponse): Paging => {
  const currentPage = response.headers['current-page'];
  const totalPages = response.headers['total-pages'];
  const totalItems = response.headers['total-count'];
  const pageItems = response.headers['page-items'];

  return {
    current: parsePagingHeaderValue(currentPage),
    totalPages: parsePagingHeaderValue(totalPages),
    totalItems: parsePagingHeaderValue(totalItems),
    pageItems: parsePagingHeaderValue(pageItems),
  };
}