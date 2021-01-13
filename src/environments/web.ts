import { Vaultifier } from "..";
import { isTest } from "../environment";
import { PrivateKeyCredentials, VaultCredentials } from "../interfaces";

const params = new URL(window.location.href).searchParams;
const getParam = (name: string): string | undefined => params.get(name) || undefined;

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
      clientId,
      repo,
    } = _options

    // in web environments, we just fall back to the window's location origin, if there is no parameter specified
    const baseUrl = getParam(baseUrlParamName) || window.location.origin;

    const appKey = getParam(appKeyParamName);
    const appSecret = getParam(appSecretParamName);

    const credentials: VaultCredentials | undefined = (appKey && appSecret) ? {
      appKey,
      appSecret,
    } : undefined;

    const masterKey = getParam(masterKeyParamName);
    const nonce = getParam(nonceParamName);

    const end2end: PrivateKeyCredentials | undefined = (masterKey && nonce) ? {
      masterKey,
      nonce,
    } : undefined;

    const vaultifier = new Vaultifier(
      baseUrl,
      repo,
      credentials,
      end2end,
    );

    // if no credentials are provided as url parameters
    // we try to login via OAuth, if supported
    if (!credentials) {
      const authCode = getParam(authorizationCodeParamName);

      if (authCode) {
        const code = getParam(authorizationCodeParamName);

        if (code) {
          const clientId = getParam(clientIdParamName);
          const clientSecret = getParam(clientSecretParamName);

          if (clientId && clientSecret) {
            vaultifier.setCredentials({
              appKey: clientId,
              appSecret: clientSecret,
            });
          }
        }
        else if (clientId) {
          window.location.href = vaultifier.urls.getOAuthAuthorizationCode(clientId, window.encodeURIComponent(window.location.href));
          // we just wait forever as the browser is now changing the visible page ;-)
          await new Promise(() => undefined);
        }
      }
    }

    if (!isTest) {
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
    }

    return vaultifier;
  }
}