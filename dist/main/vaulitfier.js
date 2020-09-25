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
class VaultifierUrls {
    constructor(baseUrl, repo) {
        this.baseUrl = baseUrl;
        this.repo = repo;
        this.getData = (itemId) => itemId ?
            `${this.baseUrl}/api/items/${itemId}/details` :
            `${this.baseUrl}/api/repos/${this.repo}/items`;
        if (new URL(baseUrl).protocol !== 'https:')
            throw Error('Protocol of baseUrl is not "https".');
        this.token = `${baseUrl}/oauth/token`;
        this.postData = `${baseUrl}/api/repos/${repo}/items`;
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
                    this.publicKey = pubKeyResponse.data['public_key'];
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
    /**
     * Posts data into the data vault's repository
     *
     * @param {Object} data JSON data to post into the repository
     *
     * @returns {Promise<VaultItemMeta>}
     */
    postItem(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataString = JSON.stringify(data);
            const dataToPost = this._usesEncryption ? JSON.stringify(crypto_1.encrypt(dataString, this.publicKey)) : dataString;
            const res = yield this.communicator.post(this.urls.postData, true, dataToPost);
            return res.data;
        });
    }
    /**
     * Retrieve data from the data vault's repository
     *
     * @returns {Promise<VaultItem>}
     */
    getItem(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.communicator.get(this.urls.getData(itemId), true);
            const item = res.data;
            try {
                // item usually contains JSON data, therefore we try to parse the string
                item.value = JSON.parse(item.value);
            }
            catch ( /* */_a) { /* */ }
            return item;
        });
    }
    /**
     * Retrieve data from the data vault's repository
     *
     * @returns {Promise<any[]>} array of JSON data
     */
    getItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.communicator.get(this.urls.getData(), true);
            const data = res.data;
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
                    'client_id': (_a = this.credentials) === null || _a === void 0 ? void 0 : _a.appKey,
                    'client_secret': (_b = this.credentials) === null || _b === void 0 ? void 0 : _b.appSecret,
                    'grant_type': 'client_credentials'
                }));
                token = response.data['access_token'];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlEQUE4RDtBQUM5RCxxQ0FBbUM7QUFDbkMscUNBQTZDO0FBaUI1QyxDQUFDO0FBSUYsTUFBTSxjQUFjO0lBTWxCLFlBQ1UsT0FBZSxFQUNmLElBQVk7UUFEWixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsU0FBSSxHQUFKLElBQUksQ0FBUTtRQVd0QixZQUFPLEdBQUcsQ0FBQyxNQUFlLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JDLEdBQUcsSUFBSSxDQUFDLE9BQU8sY0FBYyxNQUFNLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLEdBQUcsSUFBSSxDQUFDLE9BQU8sY0FBYyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUM7UUFYL0MsSUFBSSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEtBQUssUUFBUTtZQUN4QyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxPQUFPLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsT0FBTyxjQUFjLElBQUksUUFBUSxDQUFDO1FBQ3JELElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxPQUFPLGNBQWMsSUFBSSxVQUFVLENBQUM7UUFDeEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLE9BQU8sb0JBQW9CLENBQUM7SUFDbkQsQ0FBQztDQUtGO0FBRUQsTUFBYSxVQUFVO0lBT3JCOzs7OztPQUtHO0lBQ0gsWUFDUyxPQUFlLEVBQ2YsSUFBWSxFQUNaLFdBQThCO1FBRjlCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1FBbUJ2Qzs7Ozs7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