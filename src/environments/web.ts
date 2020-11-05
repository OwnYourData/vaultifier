import { Vaultifier } from "..";
import { PrivateKeyCredentials } from "../interfaces";

export abstract class VaultifierWeb {

  /**
   * Creates a Vaultifier object by retrieving connection data from URL query parameters
   * 
   * @param {string} repo Repository, where to write to. This is defined in your plugin's manifest
   * @param {string} [baseUrlParamName="PIA_URL"] Name of query parameter used to retrieve the data vault's base url
   * @param {string} [appKeyParamName="APP_KEY"] Name of query parameter used to retrieve the plugin's "Identifier" (appKey)
   * @param {string} [appSecretParamName="APP_SECRET"] Name of query parameter used to retrieve the plugin's "Secret" (appSecret)
   * 
   * @returns {Vaultifier} a new Vaultifier instance
   */
  static create(
    repo: string,
    baseUrlParamName = 'PIA_URL',
    appKeyParamName = 'APP_KEY',
    appSecretParamName = 'APP_SECRET',
    masterKeyParamName = 'MASTER_KEY',
    nonceParamName = 'NONCE',
  ): Vaultifier {
    const params = new URL(window.location.href).searchParams;

    const baseUrl = params.get(baseUrlParamName);

    if (!baseUrl)
      throw new Error('PIA_URL was not specified in url params.');

    const masterKey = params.get(masterKeyParamName);
    const nonce = params.get(nonceParamName);

    const end2end: PrivateKeyCredentials | undefined = (masterKey && nonce) ? {
      masterKey,
      nonce,
    } : undefined;

    return new Vaultifier(
      params.get(baseUrlParamName) as string,
      repo,
      {
        appKey: params.get(appKeyParamName) as string,
        appSecret: params.get(appSecretParamName) as string
      },
      end2end,
    );
  }
}