"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vaultifier = void 0;
const communicator_1 = require("./communicator");
const crypto_1 = require("./crypto");
const errors_1 = require("./errors");
const helpers_1 = require("./helpers");
const urls_1 = require("./urls");
class Vaultifier {
    /**
     *
     * @param baseUrl The base url of your data vault (e.g. https://data-vault.eu).
     * @param repo Repository, where to write to. This is defined in your plugin's manifest
     * @param credentials "Identifier" (appKey) that was generated after registering the plugin. "Secret" (appSecret) that was generated after registering the plugin.
     */
    constructor(baseUrl, repo, credentials, privateKeyCredentials) {
        this.baseUrl = baseUrl;
        this.repo = repo;
        this.credentials = credentials;
        this.privateKeyCredentials = privateKeyCredentials;
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
        this.urls = new urls_1.VaultifierUrls(baseUrl, repo);
        this.communicator = new communicator_1.Communicator();
    }
    /**
     * Returns an object that can be checked for supported features of the provided endpoint
     */
    getVaultSupport() {
        return __awaiter(this, void 0, void 0, function* () {
            // only fetch it once
            if (this.supports)
                return this.supports;
            // TODO: fetch information about the container (e.g. name) -> /api/info
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
     * This switches to the given repository name
     * As the data vault also provides the functionality to have public keys per repo
     * this function could be used to create a new instance of Vaultifier
     * But as this functionality is not yet active, it just changes the repo without doing anything further
     *
     * @param repoName Repository that should be used in the returned instance of Vaultifier
     */
    fromRepo(repoName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.repo = repoName;
            this.urls.setRepo(repoName);
            return this;
        });
    }
    /**
     * Enables or disables end-to-end encryption
     *
     * @param isActive
     */
    setEnd2EndEncryption(isActive = true) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // if endpoint does not support repos, there is no way to encrypt data, because of missing public key
            if (!isActive || !((_a = this.supports) === null || _a === void 0 ? void 0 : _a.repos)) {
                this.publicKey = undefined;
                this.privateKey = undefined;
            }
            else {
                try {
                    this.publicKey = (yield this.communicator.get(this.urls.publicKey(), true))
                        .data.public_key;
                    if (this.privateKeyCredentials) {
                        const { nonce, masterKey } = this.privateKeyCredentials;
                        const encryptedPassword = (yield this.communicator.get(this.urls.getEncryptedPassword(this.privateKeyCredentials.nonce)))
                            .data.cipher;
                        const password = yield crypto_1.decrypt({
                            value: encryptedPassword,
                            nonce,
                        }, {
                            cipher: masterKey,
                            isHashed: true,
                        });
                        const encryptedPrivateKey = JSON.parse((yield this.communicator.get(this.urls.privateKey, true))
                            .data.password_key);
                        this.privateKey = yield crypto_1.decrypt(encryptedPrivateKey, { cipher: password });
                    }
                }
                catch ( /* Yeah I know, error handling could be done better here... */_b) { /* Yeah I know, error handling could be done better here... */ }
            }
            return this.getEncryptionSupport();
        });
    }
    getEncryptionSupport() {
        return {
            supportsEncryption: !!this.publicKey,
            supportsDecryption: !!this.privateKey,
        };
    }
    get _usesEncryption() { return this.publicKey !== undefined && this.publicKey.length > 0; }
    encryptOrNot(value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._usesEncryption &&
                this.publicKey) {
                const dataString = JSON.stringify(value);
                return crypto_1.encrypt(dataString, this.publicKey);
            }
            return value;
        });
    }
    decryptOrNot(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._usesEncryption &&
                this.privateKey &&
                crypto_1.isEncrypted(item)) {
                const decrypted = yield crypto_1.decrypt(item, { cipher: this.privateKey });
                try {
                    return JSON.parse(decrypted);
                }
                catch ( /* the encrypted data is delivered as string */_a) { /* the encrypted data is delivered as string */ }
            }
            return item;
        });
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
     * Contains all necessary transformations and checks for posting/putting data to the data vault
     *
     * @param item Data to be posted/put to the data vault
     */
    getPutPostValue(item) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            item.content = yield this.encryptOrNot(item.content);
            if (!item.repo)
                item.repo = this.repo;
            const { content, dri, mimeType, schemaDri, repo } = item;
            // POST/PUT object is slightly different to our internal structure
            const dataToPost = {
                content,
                dri,
                mime_type: mimeType,
                schema_dri: schemaDri,
            };
            if ((_a = this.supports) === null || _a === void 0 ? void 0 : _a.repos)
                dataToPost.table_name = repo;
            return JSON.stringify(dataToPost);
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
            const res = yield this.communicator.post(this.urls.postItem, true, yield this.getPutPostValue(item));
            return res.data;
        });
    }
    /**
     * Puts an item into the data vault's repository (update), including any metadata
     *
     * @param item data that is going to be passed to the data vault for updating the record
     */
    updateItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.communicator.put(this.urls.putItem, true, yield this.getPutPostValue(item));
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
            const item = Object.assign(Object.assign({}, helpers_1.parseVaultItemMeta(data)), { isEncrypted: crypto_1.isEncrypted(data.content), content: yield this.decryptOrNot(data.content) });
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
            return data.map(helpers_1.parseVaultItemMeta);
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
            return data.map((x) => ({
                dri: x,
                title: undefined,
            }));
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
                throw new errors_1.UnauthorizedError();
            }
            return token;
        });
    }
}
exports.Vaultifier = Vaultifier;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlEQUE4RDtBQUM5RCxxQ0FBdUU7QUFDdkUscUNBQTZDO0FBQzdDLHVDQUErQztBQWUvQyxpQ0FBd0M7QUFPeEMsTUFBYSxVQUFVO0lBVXJCOzs7OztPQUtHO0lBQ0gsWUFDUyxPQUFlLEVBQ2YsSUFBWSxFQUNaLFdBQThCLEVBQzlCLHFCQUE2QztRQUg3QyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGdCQUFXLEdBQVgsV0FBVyxDQUFtQjtRQUM5QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXdCO1FBeUV0RDs7Ozs7Ozs7V0FRRztRQUNILHNCQUFpQixHQUFHLENBQUMsT0FBd0IsRUFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFoRjdHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxxQkFBYyxDQUM1QixPQUFPLEVBQ1AsSUFBSSxDQUNMLENBQUM7UUFFRixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNHLGVBQWU7O1lBQ25CLHFCQUFxQjtZQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUNmLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUV2Qix1RUFBdUU7WUFDdkUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3RCxPQUFPLElBQUksQ0FBQyxRQUFRLEdBQUc7Z0JBQ3JCLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUs7Z0JBQ25C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