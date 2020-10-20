import { Communicator, NetworkAdapter } from './communicator';
import { encrypt } from './crypto';
import { UnauthorizedError } from './errors';
import {
  VaultCredentials,
  VaultItem,
  VaultItemQuery,
  VaultItemsQuery,
  VaultMinMeta,
  VaultPostItem,
  VaultRepo,
  VaultSchema,
  VaultValue,
} from './interfaces';
import { VaultifierUrls } from './urls';

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
   * This creates a new instance of Vaultifier with the given repository name
   * 
   * @param {string} repoName Repository that shoudl be used in the returned instance of Vaultifier
   * 
   * @returns {Promise<Vaultifier>}
   */
  async fromRepo(repoName: string): Promise<Vaultifier> {
    const vaultifier = new Vaultifier(
      this.baseUrl,
      repoName,
      this.credentials,
    );

    await vaultifier.initialize();
    await vaultifier.setEnd2EndEncryption(this._usesEncryption);

    return vaultifier;
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
        this.publicKey = pubKeyResponse.data.public_key;

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
  private encryptOrNot(value: any): any {
    if (this._usesEncryption) {
      const dataString = JSON.stringify(value);
      return encrypt(dataString, this.publicKey as string);
    }

    return value;
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
   * Posts an item into the data vault's repository, including any metadata
   * 
   * @param item data that is going to be passed to the data vault
   *
   * @returns {Promise<VaultMinMeta>}
   */
  async postItem(item: VaultPostItem): Promise<VaultMinMeta> {
    item.content = this.encryptOrNot(item.content);

    if (!item.repo)
      item.repo = this.repo;

    const { content, dri, mimeType, schemaDri, repo } = item;

    // POST object is slightly different to our internal structure
    const dataToPost = {
      content,
      dri,
      table_name: repo,
      mime_type: mimeType,
      schema_dri: schemaDri,
    }

    const res = await this.communicator.post(this.urls.postItem, true, JSON.stringify(dataToPost));

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
    const { data } = await this.communicator.get(this.urls.getItem(query), true);
    let content = data.value;

    try {
      // item usually contains JSON data, therefore we try to parse the string
      content = JSON.parse(content);
      // actual data is wrapped another time
      // TODO: look at this inconsistency
      if (content.content)
        content = content.content;
    } catch { /* */ }

    const item = {
      id: data.id,
      content,
      accessCount: data.access_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      repoId: data.repo_id,
      repoName: data.repo_name,
      dri: data.dri,
      schemaDri: data.schema_dri,
      mimeType: data.mime_type,
      merkleId: data.merkle_id,
      oydHash: data.oyd_hash,
      oydSourcePileId: data.oyd_source_pile_id,
    }

    return item;
  }

  /**
   * Retrieve data from the data vault's repository without metadata
   *
   * @param {VaultItemsQuery} [query] Query parameters to specify the records that have to be queried
   *
   * @returns {Promise<VaultMinMeta[]>} array of JSON data
   */
  async getValues(query?: VaultItemsQuery): Promise<VaultMinMeta[]> {
    const { data } = await this.communicator.get(this.urls.getItems(query), true);

    // item usually contains JSON data, therefore we try to parse the string
    return data.map((item: any) => {
      try {
        return JSON.parse(item) as VaultMinMeta;
      } catch { /* */ }

      return item as VaultMinMeta;
    });
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
   * Gets all repositories for the current plugin credentials
   * 
   * @returns {Promise<VaultRepo[]}
   */
  async getRepos(): Promise<VaultRepo[]> {
    const { data } = await this.communicator.get(this.urls.getRepos, true);

    return data as VaultRepo[];
  }

  /**
   * Queries all OCA schemas that are available within the user's vault
   * 
   * @returns {Promise<VaultSchema[]}
   */
  async getSchemas(): Promise<VaultSchema[]> {
    const { data } = await this.communicator.get(this.urls.getSchemas(), true);

    return data.map((x: any) => ({ dri: x })) as VaultSchema[];
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
        client_id: this.credentials?.appKey,
        client_secret: this.credentials?.appSecret,
        grant_type: 'client_credentials'
      }));

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