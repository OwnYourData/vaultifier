import { VaultItemQuery, VaultItemsQuery } from './interfaces';

// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
  readonly active: string;
  readonly support: string;
  readonly token: string;
  readonly privateKey: string;
  readonly postValue: string;
  readonly postItem: string;
  readonly getRepos: string;

  constructor(
    public baseUrl: string = '',
    private repo?: string
  ) {
    // TODO: re-enable this security barrier
    // don't allow insecure builds for production mode
    // if (process.env.NODE_ENV === 'production' && new URL(baseUrl).protocol !== 'https:')
    //   throw Error('Protocol of baseUrl is not "https".');

    this.token = `${baseUrl}/oauth/token`;

    this.active = `${baseUrl}/api/active`;
    this.support = `${baseUrl}/api/support`
    this.postValue = `${baseUrl}/api/data`;
    this.postItem = `${baseUrl}/api/data`;
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

  // putting an item uses the same url as deleting an item
  putItem = (query: VaultItemQuery) => this.deleteItem(query);

  getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
  resolveInstallCode = (code: string) => `${this.baseUrl}/api/install/${code}`;
  publicKey = () =>
    // oyd.settings is the default repo for storing the public key
    `${this.baseUrl}/api/repos/${this.repo || 'oyd.settings'}/pub_key`;
  getEncryptedPassword = (nonce: string) => `${this.support}/${nonce}`;

  getOAuthAuthorizationCode = (clientId: string, redirectUri: string) => `${this.baseUrl}/oauth/authorize?client_id=${clientId}&redirect_uri${redirectUri}&response_type=code`

  setRepo = (repo: string) => this.repo = repo;
}
