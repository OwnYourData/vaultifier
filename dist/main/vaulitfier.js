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
;
// TODO: User should be able to change repo on the fly
class VaultifierUrls {
    constructor(baseUrl, repo) {
        this.baseUrl = baseUrl;
        this.repo = repo;
        this.getItem = (itemId) => itemId ?
            `${this.baseUrl}/api/items/${itemId}/details` :
            `${this.baseUrl}/api/repos/${this.repo}/items`;
        this.getValue = (query) => query.dri ?
            `${this.baseUrl}/api/data?dri=${query.dri}` :
            `${this.baseUrl}/api/data?id=${query.id}`;
        if (new URL(baseUrl).protocol !== 'https:')
            throw Error('Protocol of baseUrl is not "https".');
        this.token = `${baseUrl}/oauth/token`;
        this.postValue = `${baseUrl}/api/repos/${repo}/items`;
        this.postItem = `${baseUrl}/api/data`;
        this.publicKey = `${baseUrl}/api/repos/${repo}/pub_key`;
        this.privateKey = `${baseUrl}/api/users/current`;
    }
}
class Vaultifier {
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
        this.communicator = new communicator_1.Communicator(() => this._authorize());
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
            return crypto_1.encrypt(dataString, this.publicKey);
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
     * @returns {Promise<VaultMinMeta>} the value of the specified item
     */
    getValue(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.communicator.get(this.urls.getValue(query), true);
            const item = res.data;
            try {
                // item usually contains JSON data, therefore we try to parse the string
                return JSON.parse(item);
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
            let item;
            if (query.id) {
                const { data } = yield this.communicator.get(this.urls.getItem(query.id), true);
                item = {
                    id: data.id,
                    value: data.value,
                    accessCount: data.access_count,
                    createdAt: new Date(data.created_at),
                    updatedAt: new Date(data.updated_at),
                    repoId: data.repo_id,
                    repoName: data.repo_name,
                    dri: data.dri,
                    schemaDri: data.schema_dri,
                    mimeType: data.mime_type,
                    merkleId: data.merkle_id,
                    oydHash: data.oyd_hash,
                    oydSourcePileId: data.oyd_source_pile_id,
                };
            }
            else {
                const { id } = yield this.getValue(query);
                return this.getItem({
                    id,
                });
            }
            try {
                // item usually contains JSON data, therefore we try to parse the string
                item.value = JSON.parse(item.value);
            }
            catch ( /* */_a) { /* */ }
            return item;
        });
    }
    /**
     * Retrieve data from the data vault's repository without metadata
     *
     * @returns {Promise<VaultMinMeta[]>} array of JSON data
     */
    getValues() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.communicator.get(this.urls.getItem(), true);
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
     * @returns {boolean} true, if Vaultifier has all necessary data and was initalized correctly.
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
        if (!this.repo || !((_a = this.credentials) === null || _a === void 0 ? void 0 : _a.appKey) || !((_b = this.credentials) === null || _b === void 0 ? void 0 : _b.appSecret))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlEQUE4RDtBQUM5RCxxQ0FBbUM7QUFDbkMscUNBQTZDO0FBc0I1QyxDQUFDO0FBaUJGLHNEQUFzRDtBQUN0RCxNQUFNLGNBQWM7SUFPbEIsWUFDVSxPQUFlLEVBQ2YsSUFBWTtRQURaLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixTQUFJLEdBQUosSUFBSSxDQUFRO1FBWXRCLFlBQU8sR0FBRyxDQUFDLE1BQWUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDckMsR0FBRyxJQUFJLENBQUMsT0FBTyxjQUFjLE1BQU0sVUFBVSxDQUFDLENBQUM7WUFDL0MsR0FBRyxJQUFJLENBQUMsT0FBTyxjQUFjLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQztRQUVqRCxhQUFRLEdBQUcsQ0FBQyxLQUFxQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0MsR0FBRyxJQUFJLENBQUMsT0FBTyxpQkFBaUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDN0MsR0FBRyxJQUFJLENBQUMsT0FBTyxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBaEIxQyxJQUFJLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRO1lBQ3hDLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFFckQsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLE9BQU8sY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLGNBQWMsSUFBSSxRQUFRLENBQUM7UUFDdEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcs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