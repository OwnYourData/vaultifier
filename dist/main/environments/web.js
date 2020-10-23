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
        const baseUrl = params.get(baseUrlParamName);
        if (!baseUrl)
            throw new Error('PIA_URL was not specified in url params.');
        return new __1.Vaultifier(params.get(baseUrlParamName), repo, {
            appKey: params.get(appKeyParamName),
            appSecret: params.get(appSecretParamName)
        });
    }
}
exports.VaultifierWeb = VaultifierWeb;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Vudmlyb25tZW50cy93ZWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEJBQWdDO0FBRWhDLE1BQXNCLGFBQWE7SUFFakM7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FDWCxJQUFZLEVBQ1osZ0JBQWdCLEdBQUcsU0FBUyxFQUM1QixlQUFlLEdBQUcsU0FBUyxFQUMzQixrQkFBa0IsR0FBRyxZQUFZO1FBRWpDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDO1FBRTFELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsT0FBTztZQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUU5RCxPQUFPLElBQUksY0FBVSxDQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFXLEVBQ3RDLElBQUksRUFDSjtZQUNFLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBVztZQUM3QyxTQUFTLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBVztTQUNwRCxDQUNGLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUFsQ0Qsc0NBa0NDIn0=