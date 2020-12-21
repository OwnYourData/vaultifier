import { PageQuery, VaultItemQuery, VaultItemsQuery } from './interfaces';

// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
  readonly active: string;
  readonly support: string;
  readonly token: string;
  readonly privateKey: string;
  readonly postValue: string;
  readonly postItem: string;
  readonly getRepos: string;
  readonly usagePolicy: string;

  constructor(
    public baseUrl: string = 'https://data-vault.eu',
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
    this.usagePolicy = `${baseUrl}/api/meta/usage`;
  }

  private getPagingParam = (page: PageQuery | undefined) =>
    `${page?.page ? `&page=${page.page}` : ''}`;

  private getMultiple = (format: string, query?: VaultItemsQuery) =>
    query?.schemaDri
      ? `${this.baseUrl}/api/data?schema_dri=${query.schemaDri}&f=${format}${this.getPagingParam(query?.page)}`
      : `${this.baseUrl}/api/data?repo_id=${this.repo}&f=${format}${this.getPagingParam(query?.page)}`;

  getMetaItems = (query?: VaultItemsQuery): string => this.getMultiple('meta', query);
  getItems = (query?: VaultItemsQuery): string => this.getMultiple('full', query);
  getValues = (query?: VaultItemsQuery) => this.getMultiple('plain', query);

  private getSingle = (format: string, query: VaultItemQuery) =>
    query.id
      ? `${this.baseUrl}/api/data/${query.id}?p=id&f=${format}`
      : `${this.baseUrl}/api/data/${query.dri}?p=dri&f=${format}`;

  getItem = (query: VaultItemQuery): string => this.getSingle('full', query);
  getValue = (query: VaultItemQuery) => this.getSingle('plain', query);

  deleteItem = (query: VaultItemQuery) =>
    query.id
      ? `${this.baseUrl}/api/data/${query.id}?p=id`
      : `${this.baseUrl}/api/data/${query.dri}?p=dri`;

  // putting an item uses the same url as deleting an item
  putItem = (query: VaultItemQuery) => this.deleteItem(query);

  getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
  resolveInstallCode = (code: string) => `${this.baseUrl}/api/install/${code}`;
  publicKey = () =>
    // oyd.settings is the default repo for storing the public key
    `${this.baseUrl}/api/repos/${this.repo || 'oyd.settings'}/pub_key`;
  getEncryptedPassword = (nonce: string) => `${this.support}/${nonce}`;

  getOAuthAuthorizationCode = (clientId: string, redirectUri: string) => `${this.baseUrl}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`

  getGenericUrl = (url: string) => {
    if (!url.startsWith('/'))
      throw new Error('Generic urls must have a leading slash!');

    return `${this.baseUrl}${url}`;
  }

  setRepo = (repo: string) => this.repo = repo;
}
