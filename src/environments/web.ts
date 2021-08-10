import { Vaultifier } from "..";
import { StorageKey } from "../constants";
import { getRandomString } from '../crypto';
import { OAuthType, PrivateKeyCredentials, VaultCredentials } from "../interfaces";
import { Storage } from "../storage";
import { VaultifierUrls } from "../urls";

export interface VaultifierWebOptions {
  /**
   * Repository, where to write to. This only applies to data vaults and is specified in your plugin's manifest
   */
  repo?: string,
  /**
   * Client id used for OAuth authentication
   */
  clientId?: string,
  /**
   * Name of query parameter used to retrieve the data vault's base url
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
};

export abstract class VaultifierWeb {

  /**
   * Creates a Vaultifier object by retrieving connection data from URL query parameters
   */
  static async create(options?: Partial<VaultifierWebOptions>): Promise<Vaultifier | undefined> {
    const params = new URL(window.location.href).searchParams;
    const getParam = (name: string): string | undefined => params.get(name) || undefined;

    let _options: VaultifierWebOptions = defaultOptions;

    if (_options)
      _options = {
        ..._options,
        ...options,
      };

    const {
      appKeyParamName,
      appSecretParamName,
      authorizationCodeParamName,
      baseUrlParamName,
      clientIdParamName,
      clientSecretParamName,
      masterKeyParamName,
      nonceParamName,
      repo,
    } = _options

    let {
      clientId,
    } = _options;

    // in web environments, we just fall back to the window's location origin, if there is no parameter specified
    const baseUrl = getParam(baseUrlParamName) || window.location.origin;

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
      };

    const masterKey = getParam(masterKeyParamName);
    const nonce = getParam(nonceParamName);

    const end2end: PrivateKeyCredentials | undefined = (masterKey && nonce) ? {
      masterKey,
      nonce,
    } : undefined;

    let vaultifier = new Vaultifier(
      baseUrl,
      repo,
      credentials,
      end2end,
    );

    try {
      await vaultifier.getVaultSupport();
    }
    catch {
      // if baseUrl was specified, we try it with Vaultifier's default value
      // therefore passing undefined
      if (baseUrl) {
        vaultifier = new Vaultifier(
          undefined,
          repo,
          credentials,
          end2end,
        );

        try {
          await vaultifier.getVaultSupport();
        }
        catch (e) {
          console.error(e);
          return undefined;
        }
      }
    }

    try {
      // try initializing vaultifier to see if credentials are working
      await vaultifier.initialize();
    } catch { /* */ }


    // if we could not authorize until this stage
    // we try to login via OAuth, if supported
    const isAuthenticated = await vaultifier.isAuthenticated();
    if (!isAuthenticated) {
      if (clientId && (await vaultifier.getVaultSupport()).oAuth?.type === OAuthType.AUTHORIZATION_CODE) {
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

    window.history.replaceState(undefined, document.title, newUrl.toString());

    return vaultifier;
  }
}