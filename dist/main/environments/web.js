"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultifierWeb = void 0;
const __1 = require("..");
class VaultifierWeb {
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
    static create(repo, baseUrlParamName = 'PIA_URL', appKeyParamName = 'APP_KEY', appSecretParamName = 'APP_SECRET') {
        const params = new URL(window.location.href).searchParams;
        return new __1.Vaultifier(params.get(baseUrlParamName), repo, {
            appKey: params.get(appKeyParamName),
            appSecret: params.get(appSecretParamName)
        });
    }
}
exports.VaultifierWeb = VaultifierWeb;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Vudmlyb25tZW50cy93ZWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEJBQWdDO0FBRWhDLE1BQXNCLGFBQWE7SUFFakM7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FDWCxJQUFZLEVBQ1osZ0JBQWdCLEdBQUcsU0FBUyxFQUM1QixlQUFlLEdBQUcsU0FBUyxFQUMzQixrQkFBa0IsR0FBRyxZQUFZO1FBRWpDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDO1FBRTFELE9BQU8sSUFBSSxjQUFVLENBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQVcsRUFDdEMsSUFBSSxFQUNKO1lBQ0UsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFXO1lBQzdDLFNBQVMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFXO1NBQ3BELENBQ0YsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQTdCRCxzQ0E2QkMifQ==