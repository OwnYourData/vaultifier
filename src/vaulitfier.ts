import { Communicator, NetworkAdapter, NetworkResponse } from './communicator';
import { StorageKey } from './constants';
import { CryptoObject, decrypt, encrypt } from './crypto';
import { UnauthorizedError } from './errors';
import { getPaging, parsePostResult, parseVaultItem, parseVaultItemMeta } from './helpers';
import {
  MultiResponse,
  OAuthSupport,
  OAuthType,
  PrivateKeyCredentials,
  VaultCredentials,
  VaultData,
  VaultE2EKeys,
  VaultEncryptionSupport,
  VaultInfo,
  VaultItem,
  VaultItemQuery,
  VaultItemsQuery,
  VaultMeta,
  VaultMinMeta,
  VaultPostItem,
  VaultRepo,
  VaultSchema,
  VaultSupport,
} from './interfaces';
import { Storage } from './storage';
import { VaultifierUrls } from './urls';

import { OAuthIdentityProvider } from '.';

/**
 *
 * @param credentials "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
 * @param privateKeyCredentials Credentials for decrypting E2E encrypted data
 * @param repo Repository, where to write to. This is defined in your plugin's manifest
 */
export interface VaultifierOptions {
  credentials?: VaultCredentials;
  privateKeyCredentials?: PrivateKeyCredentials;
  /**
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  repo?: string;
}

export class Vaultifier {
  private publicKey?: string;
  private privateKey?: string;

  private communicator: Communicator;

  private supports?: VaultSupport;
  private info?: VaultInfo;

  public readonly urls: VaultifierUrls;

  /**
   *
   * @param baseUrl The base url of your data-container.
   */
  constructor(
    baseUrl: string,
    public options: VaultifierOptions = {},
  ) {
    const {
      repo,
    } = options;

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

    const { data } = await this.communicator.get(this.urls.active);
    const oAuth: (OAuthSupport | OAuthIdentityProvider)[] = [];

    if (Array.isArray(data.oauth)) {
      for (const provider of data.oauth) {
        if (
          provider.type === OAuthType.CLIENT_CREDENTIALS ||
          provider.type === OAuthType.AUTHORIZATION_CODE
        ) {
          oAuth.push(provider);
        }
        else {
          oAuth.push({
            authority: provider.authority,
            clientId: provider.client_id,
            scope: provider.scope,
            responseType: provider.response_type,
            redirectUrl: provider.redirect_url,
            title: provider.title,
            imageUrl: provider.title.pic,
            applicationId: provider.application_id,
          })
        }
      }
    }

    return this.supports = {
      repos: !!data.repos,
      authentication: !!data.auth,
      scopes: data.scopes,
      oAuth,
    };
  }

  /**
   * Returns an object with data that describes the Vault
   */
  async getVaultInfo(): Promise<VaultInfo> {
    if (this.info)
      return this.info;

    const { data } = await this.communicator.get(this.urls.info, true);

    return this.info = data;
  }

  /**
   * Retrieves the usage policy of the give data container
   * 
   * @returns the usage policy (which format is (Turtle)[https://www.w3.org/TR/turtle/]) as a string
   */
  async getUsagePolicy(): Promise<string> {
    const { data } = await this.communicator.get(this.urls.usagePolicy, true);

    return data;
  }

  /**
   * Sets the vault's credentials
   * 
   * @param credentials Object containing credentials
   */
  setCredentials(credentials: VaultCredentials): void {
    this.options.credentials = credentials;
  }

  /**
   * Returns true, if vault has (probably) valid credentials
   * This does not indicate, whether the vault will accept the credentials or not!
   */
  hasCredentials(): boolean {
    const {
      credentials,
    } = this.options;
    return !!credentials && !!credentials.appKey && !!credentials.appSecret;
  }

  /**
   * Initializes Vaultifier (authorizes against data container if necessary)
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
   * As the data container also provides the functionality to have public keys per repo
   * this function could be used to create a new instance of Vaultifier
   * But as this functionality is not yet active, it just changes the repo without doing anything further
   * 
   * @param repoId Repository that should be used in the returned instance of Vaultifier
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  async fromRepo(repoId: string): Promise<Vaultifier> {
    this.options.repo = repoId;
    this.urls.setRepo(repoId);

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
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  async setEnd2EndEncryption(isActive = true): Promise<VaultEncryptionSupport> {
    const e2eKeysKey = 'e2e-keys';

    // if endpoint does not support repos, there is no way to encrypt data, because of missing public key
    if (!isActive || !this.supports?.repos) {
      this.publicKey = undefined;
      this.privateKey = undefined;
    }
    else {
      try {
        this.publicKey = (await this.communicator.get(this.urls.publicKey(), true))
          .data.public_key;

        if (this.options.privateKeyCredentials) {
          const { nonce, masterKey } = this.options.privateKeyCredentials;

          const encryptedPassword = (await this.communicator.get(this.urls.getEncryptedPassword(this.options.privateKeyCredentials.nonce)))
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

        // basically, this "if" is not really necessary
        // it just assures we do not read from the storage unnecessarily
        // probably this does not make any difference in performance, but I consider it as good practice :-)
        if (!this.publicKey || !this.privateKey) {
          const storedKeys = Storage.getObject<VaultE2EKeys>(e2eKeysKey);

          if (storedKeys) {
            if (!this.publicKey)
              this.publicKey = storedKeys.publicKey;
            if (!this.privateKey)
              this.privateKey = storedKeys.privateKey;
          }
        }

        Storage.set(e2eKeysKey, {
          privateKey: this.privateKey,
          publicKey: this.publicKey,
        } as VaultE2EKeys);
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

  /**
   * A generic method to post data to the data container
   * 
   * @param url Url where to send the request to. Has to start with a leading slash "/"
   * @param usesAuth Whether or not the call should be authorized or not
   * @param data Data to pass to the endpoint
   */
  post = async (
    url: string,
    usesAuth?: boolean,
    data?: any,
  ): Promise<NetworkResponse> => this.communicator.post(this.urls.getGenericUrl(url), usesAuth, data);

  /**
   * A generic method to put data to the data container
   * 
   * @param url Url where to send the request to. Has to start with a leading slash "/"
   * @param usesAuth Whether or not the call should be authorized or not
   * @param data Data to pass to the endpoint
   */
  put = async (
    url: string,
    usesAuth?: boolean,
    data?: any,
  ): Promise<NetworkResponse> => this.communicator.put(this.urls.getGenericUrl(url), usesAuth, data);

  /**
   * A generic method to get data from the data container
   * 
   * @param url Url where to send the request to. Has to start with a leading slash "/"
   * @param usesAuth Whether or not the call should be authorized or not
   */
  get = async (
    url: string,
    usesAuth?: boolean,
  ): Promise<NetworkResponse> => this.communicator.get(this.urls.getGenericUrl(url), usesAuth);

  /**
   * Posts a value into the data container's repository, without any metadata
   *
   * @param {Object} value JSON data to post into the repository
   *
   * @returns {Promise<VaultMinMeta>}
   */
  async postData(value: any): Promise<VaultMinMeta> {
    const postData = await this.getPutpostData({
      data: value,
    });

    const res = await this.communicator.post(this.urls.postData, true, postData);

    return parsePostResult(res);
  }

  /**
   * Get a specified value from the vault's repository, without any metadata
   *
   * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
   *
   * @returns {Promise<VaultData>} the value of the specified item
   */
  async getData(query: VaultItemQuery): Promise<VaultData> {
    const res = await this.communicator.get(this.urls.getData(query), true);
    const item = res.data as VaultData;

    try {
      // item usually contains JSON data, therefore we try to parse the string
      item.data = JSON.parse(item.data);
    } catch { /* */ }

    return item;
  }

  /**
   * Contains all necessary transformations and checks for posting/putting data to the data container
   * 
   * @param item Data to be posted/put to the data container
   */
  private async getPutpostData(item: VaultPostItem): Promise<string> {
    const { data, id, meta } = item;

    // POST/PUT object is slightly different to our internal structure
    const dataToPost: any = {
      // we deliberately do not send a DRI
      // DRI generation is only handled by server
      meta,
      data: await this.encryptOrNot(data),
    }

    if (id)
      dataToPost.id = id;

    return JSON.stringify(dataToPost);
  }


  /**
   * Posts an item into the data container's repository, including any metadata
   * 
   * @param item data that is going to be passed to the data container
   *
   * @returns {Promise<VaultMinMeta>}
   */
  async postItem(item: VaultPostItem): Promise<VaultMinMeta> {
    const res = await this.communicator.post(this.urls.postItem, true, await this.getPutpostData(item));

    return parsePostResult(res);
  }

  /**
   * Puts an item into the data container's repository (update), including any metadata
   * 
   * @param item data that is going to be passed to the data container for updating the record
   */
  async updateItem(item: VaultPostItem): Promise<VaultMinMeta> {
    const res = await this.communicator.put(this.urls.putItem(item), true, await this.getPutpostData(item));

    return res.data as VaultMinMeta;
  }

  /**
   * Retrieve data from the data container's repository including its metadata
   *
   * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
   *
   * @returns {Promise<VaultItem>}
   */
  async getItem(query: VaultItemQuery): Promise<VaultItem> {
    const { data } = await this.communicator.get(this.urls.getItem(query), true);

    return parseVaultItem(data, this.privateKey);
  }

  /**
   * Retreive provisioning data for a specific data record
   * 
   * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
   * 
   * @returns {Promise<string[]>}
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  async getProvis(query: VaultItemQuery): Promise<string[]> {
    const { data } = await this.communicator.get(this.urls.getProvis(query), true);

    return data;
  }

  /**
   * Retrieve data from data container including all metadata
   * 
   * @param query Query parameters to specify the record that has to be queried
   */
  async getItems(query?: VaultItemsQuery): Promise<MultiResponse<VaultItem>> {
    const response = await this.communicator.get(this.urls.getItems(query), true);

    const items = await Promise.all<VaultItem>(response.data.map(async (data: any) => parseVaultItem(data, this.privateKey)));

    return {
      items,
      paging: getPaging(response),
    };
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
  async getMetaItems(query?: VaultItemsQuery): Promise<MultiResponse<VaultMeta>> {
    const response = await this.communicator.get(this.urls.getMetaItems(query), true);

    return {
      items: response.data.map(parseVaultItemMeta),
      paging: getPaging(response),
    };
  }

  /**
   * Gets all repositories for the current plugin credentials
   * 
   * @deprecated currently not implemented, might be re-enabled in a future release
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
   * Queries all SOyA schemas that are available within the user's vault
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
   * Checks, whether the user is authenticated or not
   * Also returns true if Vault does not support authentication
   */
  async isAuthenticated(): Promise<boolean> {
    const support = await this.getVaultSupport();

    if (support.authentication)
      return this.communicator.hasToken();
    else
      return true;
  }

  /**
   * Resolves an install code (usually 6 digits) and returns a set of VaultCredentials, if successful.
   * VaultCredentials are automatically set to the Vaultifier instance as well.
   *
   * @param {string} code Install code, usually 6 digits
   *
   * @returns {Promise<VaultCredentials>}
   * 
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  async resolveInstallCode(code: string): Promise<VaultCredentials> {
    const { data } = await this.communicator.get(this.urls.resolveInstallCode(code), false);

    this.options.credentials = {
      appKey: data.key as string,
      appSecret: data.secret as string,
    };

    return this.options.credentials;
  }

  /**
   * Creates an eidas token that can be used as a callback parameter for the eids response POST url
   * 
   * @param id Vault item's id
   * 
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  async getEidasToken(id: number): Promise<string> {
    const { data } = await this.communicator.post(this.urls.eidasToken, true, {
      id,
    });

    return data.token;
  }

  private async _authorize(): Promise<string> {
    const vaultCredentialsStorageKey = 'vault-credentials';
    let token: string;

    try {
      const credentials = this.options.credentials;

      let body: any;
      let tokenUrl: string | undefined = undefined;

      if (
        // TODO: We should also check the possibility for code authentication
        // support.oAuth?.type === OAuthType.AUTHORIZATION_CODE &&
        credentials?.authorizationCode
      ) {
        // TODO: hm, this is probably not that nice...
        // we have to rethink our authentication mechanism, it's already very complex...
        const existingToken = this.communicator.getToken();

        // TODO: at the moment there is no way how to refresh the token once it was issued
        if (await this.isAuthenticated() && existingToken)
          return existingToken;

        const pkceSecret = Storage.pop(StorageKey.PKCE_SECRET);
        const oauthRedirectUrl = Storage.pop(StorageKey.OAUTH_REDIRECT_URL);
        const applicationId = Storage.pop(StorageKey.APPLICATION_ID);

        if (pkceSecret && oauthRedirectUrl) {
          body = {
            code: credentials.authorizationCode,
            client_id: credentials.clientId,
            code_verifier: pkceSecret,
            grant_type: OAuthType.AUTHORIZATION_CODE,
            redirect_uri: oauthRedirectUrl,
          }
        }
        else if (oauthRedirectUrl && credentials.state && applicationId) {
          tokenUrl = this.urls.getOidcSignInUrl(
            credentials.authorizationCode,
            credentials.state,
            oauthRedirectUrl,
            applicationId,
          );
        }
      }
      else {

        if (credentials?.appKey && credentials?.appSecret)
          this.options.credentials = credentials;
        else {
          const storedCredentials = Storage.getObject<VaultCredentials>(vaultCredentialsStorageKey);

          if (storedCredentials) {
            this.options.credentials = storedCredentials;
          }
          else
            throw new Error('No valid credentials provided.');
        }

        body = {
          client_id: this.options.credentials.appKey,
          client_secret: this.options.credentials.appSecret,
          grant_type: OAuthType.CLIENT_CREDENTIALS,
        };
      }

      if (this.options.credentials?.scope)
        body.scope = this.options.credentials.scope;

      let response: NetworkResponse;
      if (tokenUrl)
        response = await this.communicator.get(tokenUrl, false);
      else
        response = await this.communicator.post(this.urls.token, false, body);

      token = response.data.access_token as string;

      // we only save the credentials if they are appKey and appSecret
      // authorizationCode does not make sense to store
      if (this.options.credentials?.appKey && this.options.credentials.appSecret) {
        Storage.set(vaultCredentialsStorageKey, this.options.credentials);
      }
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
   * 
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  static getRepositoryPath = (...path: Array<string>): string =>
    path
      // filter empty strings
      .filter(x => !!x)
      .join('.');
}