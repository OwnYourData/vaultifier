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
    static create(repo, baseUrlParamName = 'PIA_URL', appKeyParamName = 'APP_KEY', appSecretParamName = 'APP_SECRET', masterKeyParamName = 'MASTER_KEY', nonceParamName = 'NONCE') {
        const params = new URL(window.location.href).searchParams;
        const baseUrl = params.get(baseUrlParamName);
        if (!baseUrl)
            throw new Error('PIA_URL was not specified in url params.');
        const masterKey = params.get(masterKeyParamName);
        const nonce = params.get(nonceParamName);
        const end2end = (masterKey && nonce) ? {
            masterKey,
            nonce,
        } : undefined;
        return new __1.Vaultifier(params.get(baseUrlParamName), repo, {
            appKey: params.get(appKeyParamName),
            appSecret: params.get(appSecretParamName)
        }, end2end);
    }
}
exports.VaultifierWeb = VaultifierWeb;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Vudmlyb25tZW50cy93ZWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMEJBQWdDO0FBR2hDLE1BQXNCLGFBQWE7SUFFakM7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FDWCxJQUFZLEVBQ1osZ0JBQWdCLEdBQUcsU0FBUyxFQUM1QixlQUFlLEdBQUcsU0FBUyxFQUMzQixrQkFBa0IsR0FBRyxZQUFZLEVBQ2pDLGtCQUFrQixHQUFHLFlBQVksRUFDakMsY0FBYyxHQUFHLE9BQU87UUFFeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUM7UUFFMUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxPQUFPO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNqRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sT0FBTyxHQUFzQyxDQUFDLFNBQVMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEUsU0FBUztZQUNULEtBQUs7U0FDTixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFZCxPQUFPLElBQUksY0FBVSxDQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFXLEVBQ3RDLElBQUksRUFDSjtZQUNFLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBVztZQUM3QyxTQUFTLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBVztTQUNwRCxFQUNELE9BQU8sQ0FDUixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBN0NELHNDQTZDQyJ9