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
class VaultifierUrls {
    constructor(baseUrl, repo) {
        if (new URL(baseUrl).protocol !== 'https:')
            throw Error('Protocol of baseUrl is not "https".');
        this.token = `${baseUrl}/oauth/token`;
        this.data = `${baseUrl}/api/repos/${repo}/items`;
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
     * @returns {Promise<void>}
     */
    postData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataString = JSON.stringify(data);
            const dataToPost = this._usesEncryption ? JSON.stringify(encrypt(dataString, this.publicKey)) : dataString;
            this.communicator.post(this.urls.data, true, dataToPost);
        });
    }
    /**
     * Retrieve data from the data vault's repository
     *
     * @returns TODO:
     */
    getData( /* TODO: there should be constraints here */) {
        return __awaiter(this, void 0, void 0, function* () {
            throw 'not implemented';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQU83QyxNQUFNLGNBQWM7SUFNbEIsWUFDRSxPQUFlLEVBQ2YsSUFBWTtRQUVaLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDeEMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLE9BQU8sY0FBYyxJQUFJLFFBQVEsQ0FBQztRQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsT0FBTyxjQUFjLElBQUksVUFBVSxDQUFDO1FBQ3hELElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxPQUFPLG9CQUFvQixDQUFDO0lBQ25ELENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxVQUFVO0lBT3JCOzs7OztPQUtHO0lBQ0gsWUFDUyxPQUFlLEVBQ2YsSUFBWSxFQUNaLFdBQThCO1FBRjlCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1FBd0YvQix1QkFBa0IsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7UUF0Rm5GLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxjQUFjLENBQzVCLE9BQU8sRUFDUCxJQUFJLENB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