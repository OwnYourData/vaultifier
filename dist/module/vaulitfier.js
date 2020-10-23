var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Communicator } from './communicator';
import { encrypt } from './crypto';
import { UnauthorizedError } from './errors';
import { parseVaultItemMeta } from './helpers';
import { VaultifierUrls } from './urls';
export class Vaultifier {
    /**
     *
     * @param {string} baseUrl The base url of your data vault (e.g. https://data-vault.eu). Communication is only allowed via https
     * @param {string} repo Repository, where to write to. This is defined in your plugin's manifest
     * @param {string} [credentials] "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
     */
    constructor(baseUrl, repo, credentials) {
        this.baseUrl = baseUrl;
        this.repo = repo;
        this.credentials = credentials;
        /**
         * This enables to intercept all network calls made by Vaultifier
         * This is helpful, if you are already using a library for all your network calls
         * If "setNetworkAdapter" is called without providing an adapter, Vaultifier's default adapter is used
         *
         * @param {NetworkAdapter} [adapter]
         *
         * @returns {NetworkAdapter} the network adapter that will be used by Vaultifier
         */
        this.setNetworkAdapter = (adapter) => this.communicator.setNetworkAdapter(adapter);
        this.urls = new VaultifierUrls(baseUrl, repo);
        this.communicator = new Communicator();
    }
    /**
     * Returns an object that can be checked for supported features of the provided endpoint
     */
    getVaultSupport() {
        return __awaiter(this, void 0, void 0, function* () {
            // only fetch it once
            if (this.supports)
                return this.supports;
            const { data } = yield this.communicator.get(this.urls.info);
            return this.supports = {
                repos: !!data.repos,
                authentication: !!data.auth,
            };
        });
    }
    /**
     * Sets the vault's credentials
     *
     * @param credentials Object containing credentials
     */
    setCredentials(credentials) {
        this.credentials = credentials;
    }
    /**
     * Returns true, if vault has (probably) valid credentials
     * This does not indicate, whether the vault will accept the credentials or not!
     */
    hasCredentials() {
        return !!this.credentials && !!this.credentials.appKey && !!this.credentials.appSecret;
    }
    /**
     * Initializes Vaultifier (authorizes against data vault if necessary)
     *
     * @returns {Promise<void>}
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const supports = yield this.getVaultSupport();
            if (supports.authentication) {
                this.communicator.setTokenCallback(() => this._authorize());
                yield this.communicator.refreshToken();
            }
        });
    }
    /**
     * This creates a new instance of Vaultifier with the given repository name
     *
     * @param {string} repoName Repository that shoudl be used in the returned instance of Vaultifier
     *
     * @returns {Promise<Vaultifier>}
     */
    fromRepo(repoName) {
        return __awaiter(this, void 0, void 0, function* () {
            const vaultifier = new Vaultifier(this.baseUrl, repoName, this.credentials);
            yield vaultifier.initialize();
            yield vaultifier.setEnd2EndEncryption(this._usesEncryption);
            return vaultifier;
        });
    }
    /**
     * Enables or disables end-to-end encryption (if repository supports it)
     *
     * @param {boolean} [isActive=true]
     *
     * @returns {Promise<void>}
     */
    setEnd2EndEncryption(isActive = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isActive) {
                try {
                    const pubKeyResponse = yield this.communicator.get(this.urls.publicKey, true);
                    this.publicKey = pubKeyResponse.data.public_key;
                    // TODO:
                    const privateKeyResponse = yield this.communicator.get(this.urls.privateKey, true);
                    console.log(privateKeyResponse);
                    return;
                }
                catch ( /* */_a) { /* */ }
            }
            this.publicKey = undefined;
            // TODO: should return true or false, whether e2e encryption was enabled or not
        });
    }
    get _usesEncryption() { return this.publicKey !== undefined && this.publicKey.length > 0; }
    encryptOrNot(value) {
        if (this._usesEncryption) {
            const dataString = JSON.stringify(value);
            return encrypt(dataString, this.publicKey);
        }
        return value;
    }
    /**
     * Posts a value into the data vault's repository, without any metadata
     *
     * @param {Object} value JSON data to post into the repository
     *
     * @returns {Promise<VaultMinMeta>}
     */
    postValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const valueToPost = JSON.stringify(this.encryptOrNot(value));
            const res = yield this.communicator.post(this.urls.postValue, true, valueToPost);
            return res.data;
        });
    }
    /**
     * Get a specified value from the vault's repository, without any metadata
     *
     * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
     *
     * @returns {Promise<VaultValue>} the value of the specified item
     */
    getValue(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.communicator.get(this.urls.getValue(query), true);
            const item = res.data;
            try {
                // item usually contains JSON data, therefore we try to parse the string
                item.content = JSON.parse(item.content);
            }
            catch ( /* */_a) { /* */ }
            return item;
        });
    }
    /**
     * Posts an item into the data vault's repository, including any metadata
     *
     * @param item data that is going to be passed to the data vault
     *
     * @returns {Promise<VaultMinMeta>}
     */
    postItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            item.content = this.encryptOrNot(item.content);
            if (!item.repo)
                item.repo = this.repo;
            const { content, dri, mimeType, schemaDri, repo } = item;
            // POST object is slightly different to our internal structure
            const dataToPost = {
                content,
                dri,
                table_name: repo,
                mime_type: mimeType,
                schema_dri: schemaDri,
            };
            const res = yield this.communicator.post(this.urls.postItem, true, JSON.stringify(dataToPost));
            return res.data;
        });
    }
    /**
     * Retrieve data from the data vault's repository including its metadata
     *
     * @param {VaultItemQuery} query Query parameters to specify the record that has to be queried
     *
     * @returns {Promise<VaultItem>}
     */
    getItem(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.communicator.get(this.urls.getItem(query), true);
            let data = response.data;
            try {
                // item usually contains JSON data, therefore we try to parse the string
                data = JSON.parse(data);
            }
            catch ( /* */_a) { /* */ }
            const item = Object.assign(Object.assign({}, parseVaultItemMeta(data)), { content: data.content });
            return item;
        });
    }
    /**
     * Retrieve data from the data vault's repository without metadata
     *
     * @param {VaultItemsQuery} [query] Query parameters to specify the records that have to be queried
     *
     * @returns {Promise<VaultMinMeta[]>} array of JSON data
     */
    getValues(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.communicator.get(this.urls.getItems(query), true);
            // item usually contains JSON data, therefore we try to parse the string
            return data.map((item) => {
                try {
                    return JSON.parse(item);
                }
                catch ( /* */_a) { /* */ }
                return item;
            });
        });
    }
    /**
     * Deletes one item
     *
     * @param query Query parameter to specify the records that have to be deleted
     *
     * @returns {Promise<VaultMinMeta>}
     */
    deleteItem(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.communicator.delete(this.urls.deleteItem(query), true);
            return data;
        });
    }
    /**
     * Returns a list of vault items, but only with metadata (no content)
     *
     * @param query Query parameter to specify the records that have to be deleted
     */
    getMetaItems(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.communicator.get(this.urls.getMetaItems(query), true);
            return data.map(parseVaultItemMeta);
        });
    }
    /**
     * Gets all repositories for the current plugin credentials
     *
     * @returns {Promise<VaultRepo[]}
     */
    getRepos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield this.communicator.get(this.urls.getRepos, true);
                return data;
            }
            catch (_a) {
                /* This function is not implemented in semantic containers */
            }
            return;
        });
    }
    /**
     * Queries all OCA schemas that are available within the user's vault
     *
     * @returns {Promise<VaultSchema[]}
     */
    getSchemas() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.communicator.get(this.urls.getSchemas(), true);
            return data.map((x) => ({ dri: x }));
        });
    }
    /**
     * At this time, vaultifier always needs appKey and appSecret. This might change in the future.
     *
     * @returns true, if Vaultifier has all minimum necessary data and was initalized correctly.
     */
    isValid() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // test if is valid url
                new URL(this.baseUrl);
            }
            catch (e) {
                return false;
            }
            if (false === ((yield this.getVaultSupport()).authentication && ((_a = this.credentials) === null || _a === void 0 ? void 0 : _a.appKey) &&
                this.credentials.appSecret))
                return false;
            return this.communicator.isValid();
        });
    }
    /**
     * Resolves an install code (usually 6 digits) and returns a set of VaultCredentials, if successful.
     * VaultCredentials are automatically set to the Vaultifier instance as well.
     *
     * @param {string} code Install code, usually 6 digits
     *
     * @returns {Promise<VaultCredentials>}
     */
    resolveInstallCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.communicator.get(this.urls.resolveInstallCode(code), false);
            this.credentials = {
                appKey: data.key,
                appSecret: data.secret,
            };
            return this.credentials;
        });
    }
    _authorize() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let token;
            try {
                const response = yield this.communicator.post(this.urls.token, false, JSON.stringify({
                    client_id: (_a = this.credentials) === null || _a === void 0 ? void 0 : _a.appKey,
                    client_secret: (_b = this.credentials) === null || _b === void 0 ? void 0 : _b.appSecret,
                    grant_type: 'client_credentials'
                }));
                token = response.data.access_token;
            }
            catch (_c) {
                throw new UnauthorizedError();
            }
            return token;
        });
    }
}
/* static functions */
/**
 * Creates a valid repo path out of the specified string parameters
 *
 * @param path
 *
 * @returns {string}
 */
Vaultifier.getRepositoryPath = (...path) => path
    // filter empty strings
    .filter(x => !!x)
    .join('.');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQWtCLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBYS9DLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFPeEMsTUFBTSxPQUFPLFVBQVU7SUFTckI7Ozs7O09BS0c7SUFDSCxZQUNTLE9BQWUsRUFDZixJQUFZLEVBQ1osV0FBOEI7UUFGOUIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixnQkFBVyxHQUFYLFdBQVcsQ0FBbUI7UUE2RXZDOzs7Ozs7OztXQVFHO1FBQ0gsc0JBQWlCLEdBQUcsQ0FBQyxPQUF3QixFQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQXBGN0csSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGNBQWMsQ0FDNUIsT0FBTyxFQUNQLElBQUksQ0FDTCxDQUFDO1FBRUYsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNHLGVBQWU7O1lBQ25CLHFCQUFxQjtZQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUNmLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUV2QixNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUks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