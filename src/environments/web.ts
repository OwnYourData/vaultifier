import { Vaultifier } from "..";
import { OAuthType, PrivateKeyCredentials, VaultCredentials } from "../interfaces";

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
  nonceParamName: string
}

const defaultOptions: VaultifierWebOptions = {
  repo: undefined,
  clientId: undefined,
  baseUrlParamName: 'PIA_URL',
  appKeyParamName: 'APP_KEY',
  appSecretParamName: 'APP_SECRET',
  masterKeyParamName: 'MASTER_KEY',
  nonceParamName: 'NONCE',
};

export abstract class VaultifierWeb {

  /**
   * Creates a Vaultifier object by retrieving connection data from URL query parameters
   */
  static async create(options?: Partial<VaultifierWebOptions>): Promise<Vaultifier> {
    let _options: VaultifierWebOptions = defaultOptions;

    if (_options)
      _options = {
        ..._options,
        ...options,
      };

    const baseUrl = getParam(_options.baseUrlParamName);

    const appKey = getParam(_options.appKeyParamName);
    const appSecret = getParam(_options.appSecretParamName);

    const credentials: VaultCredentials | undefined = (appKey && appSecret) ? {
      appKey,
      appSecret,
    } : undefined;

    const masterKey = getParam(_options.masterKeyParamName);
    const nonce = getParam(_options.nonceParamName);

    const end2end: PrivateKeyCredentials | undefined = (masterKey && nonce) ? {
      masterKey,
      nonce,
    } : undefined;

    const vaultifier = new Vaultifier(
      baseUrl,
      _options.repo,
      credentials,
      end2end,
    );

    // if no credentials are provided as url parameters
    // we try to login via OAuth, if supported
    if (!credentials) {
      const support = await vaultifier.getVaultSupport();

      if (support.oAuth?.type === OAuthType.AUTHORIZATION_CODE) {
        const code = getParam('code');

        if (code) {
          vaultifier.setCredentials({
            authorizationCode: code,
          });
        }
        else if (_options.clientId) {
          window.location.href = vaultifier.urls.getOAuthAuthorizationCode(_options.clientId, window.location.href);
        }
      }
    }

    return vaultifier;
  }
}