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
        this._getInstallCodeUrl = (code) => `${this.baseUrl}/api/install/${code}`;
        this.urls = new VaultifierUrls(baseUrl, repo);
        this.communicator = new Communicator(() => this._authorize());
    }
    /**
     * Initializes Vaultifier (authorizes against data vault)
     *
     * @returns {Promise<void>}
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.communicator.refreshToken();
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
     * @returns {boolean} true, if Vaultifier has all minimum necessary data and was initalized correctly.
     */
    isValid() {
        var _a, _b;
        try {
            // test if is valid url
            new URL(this.baseUrl);
        }
        catch (e) {
            return false;
        }
        if (!((_a = this.credentials) === null || _a === void 0 ? void 0 : _a.appKey) || !((_b = this.credentials) === null || _b === void 0 ? void 0 : _b.appSecret))
            return false;
        return this.communicator.isValid();
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
            const { data } = yield this.communicator.get(this._getInstallCodeUrl(code), false);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQWtCLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDN0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBYS9DLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFeEMsTUFBTSxPQUFPLFVBQVU7SUFPckI7Ozs7O09BS0c7SUFDSCxZQUNTLE9BQWUsRUFDZixJQUFZLEVBQ1osV0FBOEI7UUFGOUIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixnQkFBVyxHQUFYLFdBQVcsQ0FBbUI7UUF1Q3ZDOzs7Ozs7OztXQVFHO1FBQ0gsc0JBQWlCLEdBQUcsQ0FBQyxPQUF3QixFQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQTJOdkcsdUJBQWtCLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sZ0JBQWdCLElBQUksRUFBRSxDQUFDO1FBelFuRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksY0FBYyxDQUM1QixPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7UUFFRixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0csVUFBVTs7WUFDZCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsWUFB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