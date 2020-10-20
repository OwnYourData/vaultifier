import { VaultItemQuery, VaultItemsQuery } from './interfaces';

// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
  readonly token: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly postValue: string;
  readonly postItem: string;
  readonly getRepos: string;

  constructor(private baseUrl: string, private repo: string) {
    if (new URL(baseUrl).protocol !== 'https:')
      throw Error('Protocol of baseUrl is not "https".');

    this.token = `${baseUrl}/oauth/token`;
    this.postValue = `${baseUrl}/api/repos/${repo}/items`;
    this.postItem = `${baseUrl}/api/data`;
    this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
    this.privateKey = `${baseUrl}/api/users/current`;
    this.getRepos = `${baseUrl}/api/repos/index`;
  }

  getItem = (query: VaultItemQuery): string =>
    query.id
      ? `${this.baseUrl}/api/items/${query.id}/details`
      : `${this.baseUrl}/api/dri/${query.dri}/details`;

  getItems = (query?: VaultItemsQuery): string =>
    query
      ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}`
      : `${this.baseUrl}/api/repos/${this.repo}/items`;

  getValue = (query: VaultItemQuery) =>
    query.dri
      ? `${this.baseUrl}/api/data?dri=${query.dri}`
      : `${this.baseUrl}/api/data?id=${query.id}`;

  deleteItem = (query: VaultItemQuery) =>
    query.dri
      ? `${this.baseUrl}/api/data?dri=${query.dri}`
      : `${this.baseUrl}/api/data?id=${query.id}`;

  getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
}
