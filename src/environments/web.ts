import { UserManager } from "oidc-client";

import { OAuthIdentityProvider, OAuthSupport, Vaultifier } from "..";
import { StorageKey } from "../constants";
import { getRandomString } from '../crypto';
import { OAuthType, PrivateKeyCredentials, VaultCredentials } from "../interfaces";
import { Storage } from "../storage";
import { VaultifierUrls } from "../urls";

export interface VaultifierWebOptions {
  /**
   * Repository, where to write to. This only applies to data containers and is specified in your plugin's manifest
   * 
   * @deprecated currently not implemented, might be re-enabled in a future release
   */
  repo?: string,
  /**
   * Base URL for vaultifier instance
   */
  baseUrl?: string,
  /**
   * Client id used for OAuth authentication
   */
  clientId?: string,
  /**
   * Name of query parameter used to retrieve the data container's base url
   */
  baseUrlParamName: string,
  /**
   * Name of query parameter used to retrieve the plugin's "Identifier" (appKey)
   */
  appKeyParamName: string,
  /**
   * Name of query parameter used to retrieve the plugin's "Secret" (appSecret)
   */
  appSecretParamName: string,
  /**
   * Name of query parameter used to retrieve the master key for decrypting data
   */
  masterKeyParamName: string,
  /**
   * Name of query parameter used to retrieve the nonce for decrypting data
   */
  nonceParamName: string,
  /**
   * Name of query parameter used to retrieve the oAuth client id
   */
  clientIdParamName: string,
  /**
   * Name of query parameter used to retrieve the oAuth client secret
   */
  clientSecretParamName: string,
  /**
   * Name of query parameter used to retrieve the oAuth authorization code
   */
  authorizationCodeParamName: string,
  /**
   * Name of query parameter used to retrieve the oAuth state
   */
  stateParamName: string,
}

export interface InitConfig {
  oAuthType?: OAuthSupport | OAuthIdentityProvider,
}

const defaultOptions: VaultifierWebOptions = {
  repo: undefined,
  clientId: undefined,
  baseUrlParamName: 'PIA_URL',
  appKeyParamName: 'APP_KEY',
  appSecretParamName: 'APP_SECRET',
  masterKeyParamName: 'MASTER_KEY',
  nonceParamName: 'NONCE',
  clientIdParamName: 'client_id',
  clientSecretParamName: 'client_secret',
  authorizationCodeParamName: 'code',
  stateParamName: 'state',
};

export class VaultifierWeb {
  private static _getParamAccessor = () => {
    const params = new URL(window.location.href).searchParams;

    return (name: string): string | undefined => params.get(name) || undefined;
  }

  constructor(
    public readonly options: VaultifierWebOptions,
    public readonly vaultifier?: Vaultifier,
  ) { }

  /**
   * Creates a Vaultifier object by retrieving connection data from URL query parameters
   */
  static async create(options?: Partial<VaultifierWebOptions>): Promise<VaultifierWeb> {
    const getParam = VaultifierWeb._getParamAccessor();
    const _options: VaultifierWebOptions = {
      ...defaultOptions,
      ...options,
    }

    const {
      baseUrlParamName,
      repo,
    } = _options

    let {
      baseUrl
    } = _options;

    if (!baseUrl) {
      baseUrl = getParam(baseUrlParamName);

      if (baseUrl) {
        // in web environments we want to persist the base url
        // if it was passed via URL parameter
        // this is because if we use OAuth for login
        // we'll lose all parameters after redirect, hence we have to persist it
        Storage.set(StorageKey.BASE_URL, baseUrl);
      }
      else
        // first of all we try to fetch a stored value (see above for saving the value)
        // if this does not work we just fall back to the window's location origin, if there is no parameter specified
        baseUrl = Storage.get(StorageKey.BASE_URL) || window.location.origin;
    }

    let vaultifier: Vaultifier | undefined = new Vaultifier(
      baseUrl,
      {
        repo,
      },
    );

    try {
      await vaultifier.getVaultSupport();
    }
    catch (e) {
      console.error(e);
      vaultifier = undefined;
    }

    return new VaultifierWeb(
      _options,
      vaultifier,
    );
  }

  initialize = async (config: InitConfig = {}): Promise<Vaultifier | undefined> => {
    const vaultifier = this.vaultifier;

    if (!vaultifier)
      return undefined;

    // vaultifier must be valid in order to proceed with initialization
    if (!vaultifier.isValid())
      return undefined;

    const {
      oAuthType,
    } = config;

    const {
      appKeyParamName,
      appSecretParamName,
      authorizationCodeParamName,
      stateParamName,
      clientIdParamName,
      clientSecretParamName,
      masterKeyParamName,
      nonceParamName,
    } = this.options;

    let {
      clientId,
    } = this.options;

    const getParam = VaultifierWeb._getParamAccessor();

    const appKey = getParam(appKeyParamName);
    const appSecret = getParam(appSecretParamName);

    // if clientId parameter is specified as query parameter it is already the second step client id parameter of OAuth
    clientId = getParam(clientIdParamName) ?? clientId;
    const authorizationCode = getParam(authorizationCodeParamName);

    let credentials: VaultCredentials | undefined = undefined;
    if (appKey && appSecret)
      credentials = {
        appKey,
        appSecret,
      };
    else if (authorizationCode && clientId)
      credentials = {
        authorizationCode,
        clientId,
        state: getParam(stateParamName),
      };

    const masterKey = getParam(masterKeyParamName);
    const nonce = getParam(nonceParamName);

    const end2end: PrivateKeyCredentials | undefined = (masterKey && nonce) ? {
      masterKey,
      nonce,
    } : undefined;

    vaultifier.options.credentials = credentials;
    vaultifier.options.privateKeyCredentials = end2end;

    try {
      // try initializing vaultifier to see if credentials are working
      await vaultifier.initialize();
    } catch { /* */ }


    // if we could not authorize until this stage
    // we try to login via OAuth, if supported
    const isAuthenticated = await vaultifier.isAuthenticated();
    if (!isAuthenticated) {
      const oAuthSupport = oAuthType as OAuthSupport;

      if (clientId && oAuthSupport && oAuthSupport.type === OAuthType.AUTHORIZATION_CODE) {
        // create PKCE secret
        const pkceSecret = getRandomString(32);
        // const hashedSecret = btoa(await createSha256Hex(pkceSecret));
        const redirectUrl = VaultifierUrls.getRedirectUrl();

        // we need this secret for later OAuth token retrieval
        Storage.set(StorageKey.PKCE_SECRET, pkceSecret);
        Storage.set(StorageKey.OAUTH_REDIRECT_URL, redirectUrl);

        window.location.href = vaultifier.urls.getOAuthAuthorizationCode(clientId, window.encodeURIComponent(redirectUrl), pkceSecret);
        // we just wait forever as the browser is now changing the visible page ;-)
        await new Promise(() => undefined);
      }

      const idprov = oAuthType as OAuthIdentityProvider | undefined;
      if (idprov?.authority) {
        const redirectUrl = VaultifierUrls.getRedirectUrl();

        Storage.set(StorageKey.APPLICATION_ID, idprov.applicationId);
        Storage.set(StorageKey.OAUTH_REDIRECT_URL, redirectUrl);

        const um = new UserManager({
          authority: idprov.authority,
          client_id: idprov.clientId,
          scope: idprov.scope,
          response_type: idprov.responseType,
          redirect_uri: redirectUrl,
        });

        um.signinRedirect();
        // we just wait forever as the browser is now changing the visible page ;-)
        await new Promise(() => undefined);
      }
    }

    const newUrl = new URL(window.location.href);

    // remove sensitive information while preserving probably important url parameters
    newUrl.searchParams.delete(appKeyParamName);
    newUrl.searchParams.delete(appSecretParamName);
    newUrl.searchParams.delete(masterKeyParamName);
    newUrl.searchParams.delete(nonceParamName);
    newUrl.searchParams.delete(clientIdParamName);
    newUrl.searchParams.delete(clientSecretParamName);
    newUrl.searchParams.delete(authorizationCodeParamName);
    newUrl.searchParams.delete(stateParamName);

    window.history.replaceState(undefined, document.title, newUrl.toString());

    return vaultifier;
  }
}