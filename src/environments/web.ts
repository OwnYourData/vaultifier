import { Vaultifier } from "..";

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
  ): Vaultifier {
    const params = new URL(window.location.href).searchParams;

    return new Vaultifier(
      params.get(baseUrlParamName) as string,
      repo,
      {
        appKey: params.get(appKeyParamName) as string,
        appSecret: params.get(appSecretParamName) as string
      }
    );
  }
}