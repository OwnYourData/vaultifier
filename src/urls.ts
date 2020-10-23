import { VaultItemQuery, VaultItemsQuery } from './interfaces';

// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
  readonly info: string;
  readonly token: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly postValue: string;
  readonly postItem: string;
  readonly getRepos: string;

  constructor(private baseUrl: string, private repo: string) {
    // TODO: re-enable this security barrier
    // don't allow insecure builds for production mode
    // if (process.env.NODE_ENV === 'production' && new URL(baseUrl).protocol !== 'https:')
    //   throw Error('Protocol of baseUrl is not "https".');

    this.info = `${baseUrl}/api/active`;
    this.token = `${baseUrl}/oauth/token`;
    this.postValue = `${baseUrl}/api/data`;
    this.postItem = `${baseUrl}/api/data`;
    this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
    this.privateKey = `${baseUrl}/api/users/current`;
    this.getRepos = `${baseUrl}/api/repos/index`;
  }

  getItem = (query: VaultItemQuery): string =>
    query.id
      ? `${this.baseUrl}/api/data/${query.id}?p=id&f=full`
      : `${this.baseUrl}/api/data/${query.dri}?p=dri&f=full`;

  getMetaItems = (query?: VaultItemsQuery): string =>
    query
      ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}&f=meta`
      : `${this.baseUrl}/api/data?repo_id=${this.repo}&f=meta`;


  getItems = (query?: VaultItemsQuery): string =>
    query
      ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}&f=full`
      : `${this.baseUrl}/api/data?repo_id=${this.repo}&f=full`;

  getValue = (query: VaultItemQuery) =>
    query.dri
      ? `${this.baseUrl}/api/data/${query.dri}?p=dri&f=plain`
      : `${this.baseUrl}/api/data/${query.id}/p=id&f=plain`;

  deleteItem = (query: VaultItemQuery) =>
    query.dri
      ? `${this.baseUrl}/api/data/${query.dri}?p=dri`
      : `${this.baseUrl}/api/data/${query.id}?p=id`;

  getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
  resolveInstallCode = (code: string) => `${this.baseUrl}/api/install/${code}`;
}