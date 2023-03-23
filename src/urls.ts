import { PageQuery, VaultItemQuery, VaultItemsQuery } from './interfaces';

// TODO: User should be able to change repo on the fly
export class VaultifierUrls {
  readonly active: string;
  readonly support: string;
  readonly token: string;
  readonly privateKey: string;
  readonly postData: string;
  readonly postItem: string;
  readonly getRepos: string;
  readonly usagePolicy: string;
  readonly info: string;
  readonly eidasToken: string;

  constructor(
    public baseUrl: string,
    private repo?: string
  ) {
    // TODO: re-enable this security barrier
    // don't allow insecure builds for production mode
    // if (process.env.NODE_ENV === 'production' && new URL(baseUrl).protocol !== 'https:')
    //   throw Error('Protocol of baseUrl is not "https".');

    this.token = `${baseUrl}/oauth/token`;

    this.active = `${baseUrl}/api/active`;
    this.support = `${baseUrl}/api/support`
    this.postData = `${baseUrl}/api/data`;
    this.postItem = `${baseUrl}/api/data`;
    this.privateKey = `${baseUrl}/api/users/current`;
    this.getRepos = `${baseUrl}/api/repos/index`;
    this.usagePolicy = `${baseUrl}/api/meta/usage`;
    this.info = `${baseUrl}/api/meta/info`;
    this.eidasToken = `${this.baseUrl}/api/eidas/token`;
  }

  private getPagingParam = (page: PageQuery | undefined) =>
    `${page?.page ? `&page=${page.page}` : ''}${page?.size ? `&items=${page.size}` : ''}`;

  private getMultiple = (format: string, query?: VaultItemsQuery) => {
    if (query?.schema)
      return `${this.baseUrl}/api/data?schema=${query.schema}&f=${format}${this.getPagingParam(query?.page)}`;
    else if (this.repo)
      return `${this.baseUrl}/api/data?repo_id=${this.repo}&f=${format}${this.getPagingParam(query?.page)}`;
    else
      return `${this.baseUrl}/api/data?f=${format}${this.getPagingParam(query?.page)}`;
  }

  getMetaItems = (query?: VaultItemsQuery): string => this.getMultiple('meta', query);
  getItems = (query?: VaultItemsQuery): string => this.getMultiple('full', query);

  private getSingle = (format: string, query: VaultItemQuery) =>
    query.id
      ? `${this.baseUrl}/api/data?id=${query.id}&f=${format}`
      : `${this.baseUrl}/api/data?dri=${query.dri}&f=${format}`;

  getItem = (query: VaultItemQuery): string => this.getSingle('full', query);
  getData = (query: VaultItemQuery): string => this.getSingle('plain', query);
  getProvis = (query: VaultItemQuery): string => this.getSingle('provis', query);

  deleteItem = (query: VaultItemQuery) =>
    query.id
      ? `${this.baseUrl}/api/data?id=${query.id}`
      : `${this.baseUrl}/api/data?dri=${query.dri}`;

  // putting an item uses the same url as deleting an item
  putItem = (query: VaultItemQuery) => this.deleteItem(query);

  getSchemas = () => `${this.baseUrl}/api/meta/schemas`;
  resolveInstallCode = (code: string) => `${this.baseUrl}/api/install/${code}`;
  publicKey = () =>
    // oyd.settings is the default repo for storing the public key
    `${this.baseUrl}/api/repos/${this.repo || 'oyd.settings'}/pub_key`;
  getEncryptedPassword = (nonce: string) => `${this.support}/${nonce}`;

  getOAuthAuthorizationCode = (clientId: string, redirectUri: string, codeChallenge: string) => `${this.baseUrl}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&code_challenge=${codeChallenge}`

  getGenericUrl = (url: string) => {
    if (!url.startsWith('/'))
      throw new Error('Generic urls must have a leading slash!');

    return `${this.baseUrl}${url}`;
  }

  getEidasExternalUrl = (id: number, token: string, redirectUrl: string) => `${this.baseUrl}/api/eidas?id=${id}&token=${token}&redirect_url=${redirectUrl}`;

  getOidcSignInUrl = (code: string, state: string, redirectUrl: string, applicationId: string) =>
    `${this.baseUrl}/signin-oidc?code=${code}&state=${state}&redirect_url=${redirectUrl}&application_id=${applicationId}`;

  static getRedirectUrl = () => {
    const redirectUrl = new URL(window.location.href);
    // remove hash as this could interfere with redirection
    redirectUrl.hash = '';

    let rawUrl = redirectUrl.toString();
    // redirect URLs also must not contain any query parameters
    // as this is not allowed by OAuth
    rawUrl = rawUrl.split('?')[0];

    return rawUrl;
  }

  setRepo = (repo: string) => this.repo = repo;
}
