import { Communicator } from './communicator';
import { encrypt } from './crypto';
import { UnauthorizedError } from './errors';

interface VaultCredentials {
  appKey: string,
  appSecret: string,
}

class VaultifierUrls {
  readonly token: string;
  readonly publicKey: string;
  readonly privateKey: string;
  readonly data: string;

  constructor(
    baseUrl: string,
    repo: string,
  ) {
    if (new URL(baseUrl).protocol !== 'https')
      throw Error('Protocol of baseUrl is not "https".');

    this.token = `${baseUrl}/oauth/token`;
    this.data = `${baseUrl}/api/repos/${repo}/items`;
    this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
    this.privateKey = `${baseUrl}/api/users/current`;
  }
}

export class Vaultifier {
  private publicKey?: string;

  private urls: VaultifierUrls;

  private communicator: Communicator;

  /**
   * 
   * @param {string} baseUrl The base url of your data vault (e.g. https://data-vault.eu). Communication is only allowed via https
   * @param {string} repo Repository, where to write to. This is defined in your plugin's manifest
   * @param {string} [credentials] "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
   */
  constructor(
    public baseUrl: string,
    public repo: string,
    public credentials?: VaultCredentials
  ) {
    this.urls = new VaultifierUrls(
      baseUrl,
      repo
    );

    this.communicator = new Communicator(() => this._authorize());
  }

  /**
   * Initializes Vaultifier (authorizes against data vault)
   * 
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    await this.communicator.refreshToken();
  }

  /**
   * Enables or disables end-to-end encryption (if repository supports it)
   * 
   * @param {boolean} [isActive=true]
   * 
   * @returns {Promise<void>}
   */
  async setEnd2EndEncryption(isActive = true): Promise<void> {
    if (isActive) {
      try {
        const pubKeyResponse = await this.communicator.get(this.urls.publicKey, true);
        this.publicKey = pubKeyResponse.data['public_key'];

        // TODO:
        const privateKeyResponse = await this.communicator.get(this.urls.privateKey, true);
        console.log(privateKeyResponse);

        return;
      }
      catch { /* */ }
    }

    this.publicKey = undefined;

    // TODO: should return true or false, whether e2e encryption was enabled or not
  }

  private get _usesEncryption(): boolean { return this.publicKey !== undefined && this.publicKey.length > 0 }

  /**
   * Posts data into the data vault's repository
   * 
   * @param {Object} data JSON data to post into the repository
   * 
   * @returns {Promise<void>}
   */
  async postData(data: any): Promise<void> {
    const dataString = JSON.stringify(data);
    const dataToPost = this._usesEncryption ? JSON.stringify(encrypt(dataString, this.publicKey as string)) : dataString;
    this.communicator.post(this.urls.data, true, dataToPost);
  }

  /**
   * Retrieve data from the data vault's repository
   * 
   * @returns TODO:
   */
  async getData(/* TODO: there should be constraints here */): Promise<any> {
    throw 'not implemented';
  }

  /** 
   * @returns {boolean} true, if Vaultifier has all necessary data and was initalized correctly.
   */
  isValid(): boolean {
    try {
      // test if is valid url
      new URL(this.baseUrl);
    }
    catch (e) {
      return false;
    }

    if (!this.repo || !this.credentials?.appKey || !this.credentials?.appSecret)
      return false;

    return this.communicator.isValid();
  }

  private _getInstallCodeUrl = (code: string) => `${this.baseUrl}/api/install/${code}`;

  /**
   * Resolves an install code (usually 6 digits) and returns a set of VaultCredentials, if successful.
   * VaultCredentials are automatically set to the Vaultifier instance as well.
   * 
   * @param {string} code Install code, usually 6 digits
   * 
   * @returns {Promise<VaultCredentials>}
   */
  async resolveInstallCode(code: string): Promise<VaultCredentials> {
    const { data } = await this.communicator.get(this._getInstallCodeUrl(code), false);

    this.credentials = {
      appKey: data.key as string,
      appSecret: data.secret as string,
    };

    return this.credentials;
  }

  private async _authorize(): Promise<string> {
    let token: string;

    try {
      const response = await this.communicator.post(this.urls.token, false, JSON.stringify({
        'client_id': this.credentials?.appKey,
        'client_secret': this.credentials?.appSecret,
        'grant_type': 'client_credentials'
      }));

      token = response.data['access_token'] as string;
    }
    catch {
      throw new UnauthorizedError();
    }

    return token;
  }

  /* static functions */

  /**
   * Creates a valid repo path out of the specified string parameters
   * 
   * @param path 
   * 
   * @returns {string}
   */
  static getRepositoryPath = (...path: Array<string>): string =>
    path
      // filter empty strings
      .filter(x => !!x)
      .join('.');
}