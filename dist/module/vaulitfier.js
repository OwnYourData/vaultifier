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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQWtCLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFzQjVDLENBQUM7QUFpQkYsc0RBQXNEO0FBQ3RELE1BQU0sY0FBYztJQU9sQixZQUNVLE9BQWUsRUFDZixJQUFZO1FBRFosWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLFNBQUksR0FBSixJQUFJLENBQVE7UUFZdEIsWUFBTyxHQUFHLENBQUMsTUFBZSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxHQUFHLElBQUksQ0FBQyxPQUFPLGNBQWMsTUFBTSxVQUFVLENBQUMsQ0FBQztZQUMvQyxHQUFHLElBQUksQ0FBQyxPQUFPLGNBQWMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDO1FBRWpELGFBQVEsR0FBRyxDQUFDLEtBQXFCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvQyxHQUFHLElBQUksQ0FBQyxPQUFPLGlCQUFpQixLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM3QyxHQUFHLElBQUksQ0FBQyxPQUFPLGdCQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7UUFoQjFDLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDeEMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLE9BQU8sY0FBYyxJ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