import { Communicator, NetworkAdapter } from './communicator';
import { CryptoObject, decrypt, encrypt, isEncrypted } from './crypto';
import { UnauthorizedError } from './errors';
import { parseVaultItemMeta } from './helpers';
import {
  OAuthSupport,
  OAuthType,
  PrivateKeyCredentials,
  VaultCredentials,
  VaultEncryptionSupport,
  VaultItem,
  VaultItemQuery,
  VaultItemsQuery,
  VaultMeta,
  VaultMinMeta,
  VaultPostItem,
  VaultRepo,
  VaultSchema,
  VaultSupport,
  VaultValue,
} from './interfaces';
import { VaultifierUrls } from './urls';

export class Vaultifier {
  private publicKey?: string;
  private privateKey?: string;

  private communicator: Communicator;

  private supports?: VaultSupport;

  public readonly urls: VaultifierUrls;

  /**
   *
   * @param baseUrl The base url of your data vault (e.g. https://data-vault.eu).
   * @param repo Repository, where to write to. This is defined in your plugin's manifest
   * @param credentials "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
   */
  constructor(
    baseUrl?: string,
    public repo?: string,
    public credentials?: VaultCredentials,
    public privateKeyCredentials?: PrivateKeyCredentials,
  ) {
    this.urls = new VaultifierUrls(
      baseUrl,
      repo
    );

    this.communicator = new Communicator();
  }

  /**
   * Returns an object that can be checked for supported features of the provided endpoint
   */
  async getVaultSupport(): Promise<VaultSupport> {
    // only fetch it once
    if (this.supports)
      return this.supports;

    // TODO: fetch information about the container (e.g. name) -> /api/info
    const { data } = await this.communicator.get(this.urls.active);

    const hasAuth = !!data.auth;

    // if OAuth type is not specified by server, we assume the default, which is client_credentials
    const oAuth: OAuthSupport = (hasAuth && !data.oAuth) ? {
      type: OAuthType.CLIENT_CREDENTIALS
    } : data.oAuth;

    return this.supports = {
      repos: !!data.repos,
      authentication: !!data.auth,
      name: data.name,
      scopes: data.scopes,
      oAuth,
    };
  }

  /**
   * Sets the vault's credentials
   * 
   * @param credentials Object containing credentials
   */
  setCredentials(credentials: VaultCredentials): void {
    this.credentials = credentials;
  }

  /**
   * Returns true, if vault has (probably) valid credentials
   * This does not indicate, whether the vault will accept the credentials or not!
   */
  hasCredentials(): boolean {
    return !!this.credentials && !!this.credentials.appKey && !!this.credentials.appSecret;
  }

  /**
   * Initializes Vaultifier (authorizes against data vault if necessary)
   *
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    const supports = await this.getVaultSupport()

    if (supports.authentication) {
      this.communicator.setTokenCallback(() => this._authorize());
      await this.communicator.refreshToken();
    }
  }

  /**
   * This switches to the given repository name
   * As the data vault also provides the functionality to have public keys per repo
   * this function could be used to create a new instance of Vaultifier
   * But as this functionality is not yet active, it just changes the repo without doing anything further
   * 
   * @param repoName Repository that should be used in the returned instance of Vaultifier
   */
  async fromRepo(repoName: string): Promise<Vaultifier> {
    this.repo = repoName;
    this.urls.setRepo(repoName);

    return this;
  }

  /**
   * This enables to intercept all network calls made by Vaultifier
   * This is helpful, if you are already using a library for all your network calls
   * If "setNetworkAdapter" is called without providing an adapter, Vaultifier's default adapter is used
   *
   * @param {NetworkAdapter} [adapter]
   * 
   * @returns {NetworkAdapter} the network adapter that will be used by Vaultifier
   */
  setNetworkAdapter = (adapter?: NetworkAdapter): NetworkAdapter => this.communicator.setNetworkAdapter(adapter);

  /**
   * Enables or disables end-to-end encryption
   *
   * @param isActive
   */
  async setEnd2EndEncryption(isActive = true): Promise<VaultEncryptionSupport> {
    // if endpoint does not support repos, there is no way to encrypt data, because of missing public key
    if (!isActive || !this.supports?.repos) {
      this.publicKey = undefined;
      this.privateKey = undefined;
    }
    else {
      try {
        this.publicKey = (await this.communicator.get(this.urls.publicKey(), true))
          .data.public_key;

        if (this.privateKeyCredentials) {
          const { nonce, masterKey } = this.privateKeyCredentials;

          const encryptedPassword = (await this.communicator.get(this.urls.getEncryptedPassword(this.privateKeyCredentials.nonce)))
            .data.cipher;
          const password = await decrypt({
            value: encryptedPassword,
            nonce,
          }, {
            cipher: masterKey,
            isHashed: true,
          });

          const encryptedPrivateKey = JSON.parse(
            (await this.communicator.get(this.urls.privateKey, true))
              .data.password_key
          );

          this.privateKey = await decrypt(encryptedPrivateKey, { cipher: password });
        }
      }
      catch { /* Yeah I know, error handling could be done better here... */ }
    }

    return this.getEncryptionSupport();
  }

  getEncryptionSupport(): VaultEncryptionSupport {
    return {
      supportsEncryption: !!this.publicKey,
      supportsDecryption: !!this.privateKey,
    };
  }

  private get _usesEncryption(): boolean { return this.publicKey !== undefined && this.publicKey.length > 0 }
  private async encryptOrNot(value: any): Promise<CryptoObject | any> {
    if (
      this._usesEncryption &&
      this.publicKey
    ) {
      const dataString = JSON.stringify(value);
      return encrypt(dataString, this.publicKey);
    }

    return value;
  }
  private async decryptOrNot(item: any): Promise<any> {
    if (
      this._usesEncryption &&
      this.privateKey &&
      isEncrypted(item)
    ) {
      const decrypted = await decrypt(item, { cipher: this.privateKey });

      try {
        return JSON.parse(decrypted);
      } catch { /* the encrypted data is delivered as string */ }
    }

    return item;
  }

  /**
   * Posts a value into the data vault's repository, without any metadata
   *
   * @param {Object} value JSON data to post into the repository
   *
   * @returns {Promise<VaultMinMeta>}
   */
  async postValue(value: any): Promise<VaultMinMeta> {
    const valueToPost = JSON.stringify(this.encryptOrNot(value));

    const res = await this.communicator.post(this.urls.postValue, true, valueToPost);

    return res.data as VaultMinMeta;
  }

  /**
   * Get a specified value from the vault's repository, without any metadata
   *
   * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
   *
   * @returns {Promise<VaultValue>} the value of the specified item
   */
  async getValue(query: VaultItemQuery): Promise<VaultValue> {
    const res = await this.communicator.get(this.urls.getValue(query), true);
    const item = res.data as VaultValue;

    try {
      // item usually contains JSON data, therefore we try to parse the string
      item.content = JSON.parse(item.content);
    } catch { /* */ }

    return item;
  }

  /**
   * Contains all necessary transformations and checks for posting/putting data to the data vault
   * 
   * @param item Data to be posted/put to the data vault
   */
  private async getPutPostValue(item: VaultPostItem): Promise<string> {
    item.content = await this.encryptOrNot(item.content);

    if (!item.repo)
      item.repo = this.repo;

    const { content, dri, id, mimeType, schemaDri, repo } = item;

    // POST/PUT object is slightly different to our internal structure
    const dataToPost: any = {
      dri,
      content,
      mime_type: mimeType,
    }

    if (this.supports?.repos)
      dataToPost.table_name = repo;

    if (id)
      dataToPost.id = id;

    if (schemaDri)
      dataToPost.schema_dri = schemaDri;

    return JSON.stringify(dataToPost);
  }


  /**
   * Posts an item into the data vault's repository, including any metadata
   * 
   * @param item data that is going to be passed to the data vault
   *
   * @returns {Promise<VaultMinMeta>}
   */
  async postItem(item: VaultPostItem): Promise<VaultMinMeta> {
    const res = await this.communicator.post(this.urls.postItem, true, await this.getPutPostValue(item));

    return res.data as VaultMinMeta;
  }

  /**
   * Puts an item into the data vault's repository (update), including any metadata
   * 
   * @param item data that is going to be passed to the data vault for updating the record
   */
  async updateItem(item: VaultPostItem): Promise<VaultMinMeta> {
    const res = await this.communicator.put(this.urls.putItem(item), true, await this.getPutPostValue(item));

    return res.data as VaultMinMeta;
  }

  /**
   * Retrieve data from the data vault's repository including its metadata
   *
   * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
   *
   * @returns {Promise<VaultItem>}
   */
  async getItem(query: VaultItemQuery): Promise<VaultItem> {
    const response = await this.communicator.get(this.urls.getItem(query), true);
    let data = response.data;

    try {
      // item usually contains JSON data, therefore we try to parse the string
      data = JSON.parse(data);
    } catch { /* */ }

    const item: VaultItem = {
      ...parseVaultItemMeta(data),
      isEncrypted: isEncrypted(data.content),
      content: await this.decryptOrNot(data.content),
    };

    return item;
  }

  /**
   * Retrieve data from the data vault's repository without metadata
   *
   * @param query Query parameters to specify the records that have to be queried
   *
   * @returns array of JSON data
   */
  async getValues(query: VaultItemsQuery): Promise<any> {
    const { data } = await this.communicator.get(this.urls.getValues(query), true);

    return Promise.all(data.map((x: any) => this.decryptOrNot(x)));
  }

  /**
   * Deletes one item
   *
   * @param query Query parameter to specify the records that have to be deleted
   *
   * @returns {Promise<VaultMinMeta>}
   */
  async deleteItem(query: VaultItemQuery): Promise<VaultMinMeta> {
    const { data } = await this.communicator.delete(this.urls.deleteItem(query), true);

    return data as VaultMinMeta;
  }

  /**
   * Returns a list of vault items, but only with metadata (no content)
   * 
   * @param query Query parameter to specify the records that have to be deleted
   */
  async getMetaItems(query?: VaultItemsQuery): Promise<VaultMeta[]> {
    const { data } = await this.communicator.get(this.urls.getMetaItems(query), true);

    return data.map(parseVaultItemMeta);
  }

  /**
   * Gets all repositories for the current plugin credentials
   * 
   * @returns {Promise<VaultRepo[]}
   */
  async getRepos(): Promise<VaultRepo[] | undefined> {
    if ((await this.getVaultSupport()).repos) {
      const { data } = await this.communicator.get(this.urls.getRepos, true);
      return data as VaultRepo[];
    }

    /* This function is not implemented in semantic containers */
    return;
  }

  /**
   * Queries all OCA schemas that are available within the user's vault
   * 
   * @returns {Promise<VaultSchema[]}
   */
  async getSchemas(): Promise<VaultSchema[]> {
    const { data } = await this.communicator.get(this.urls.getSchemas(), true);

    return data.map((x: any) => ({
      dri: x,
      title: undefined,
    })) as VaultSchema[];
  }

  /**
   * Checks, whether a valid endpoint is specified or not
   * 
   * @returns true, if Vaultifier has all minimum necessary data and was initalized correctly.
   */
  async isValid(): Promise<boolean> {
    try {
      // currently we check the validity, if there is an endpoint specified 
      // that can deliver a response to the vault support api call
      await this.getVaultSupport();
      return true;
    }
    catch {
      return false;
    }
  }

  /**
   * Resolves an install code (usually 6 digits) and returns a set of VaultCredentials, if successful.
   * VaultCredentials are automatically set to the Vaultifier instance as well.
   *
   * @param {string} code Install code, usually 6 digits
   *
   * @returns {Promise<VaultCredentials>}
   */
  async resolveInstallCode(code: string): Promise<VaultCredentials> {
    const { data } = await this.communicator.get(this.urls.resolveInstallCode(code), false);

    this.credentials = {
      appKey: data.key as string,
      appSecret: data.secret as string,
    };

    return this.credentials;
  }

  private async _authorize(): Promise<string> {
    let token: string;

    try {
      const support = await this.getVaultSupport();
      const credentials = this.credentials;

      let body: any;

      if (
        support.oAuth?.type === OAuthType.AUTHORIZATION_CODE &&
        credentials?.authorizationCode
      )
        body = {
          code: this.credentials?.authorizationCode,
          grant_type: OAuthType.AUTHORIZATION_CODE,
        }
      else if (credentials?.appKey && credentials?.appSecret)
        body = {
          client_id: this.credentials?.appKey,
          client_secret: this.credentials?.appSecret,
          grant_type: OAuthType.CLIENT_CREDENTIALS,
        };
      else
        throw new Error('No valid credentials provided.')

      if (this.credentials?.scope)
        body.scope = this.credentials.scope;

      const response = await this.communicator.post(this.urls.token, false, body);

      token = response.data.access_token as string;
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