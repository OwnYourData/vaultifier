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
     * @returns {Promise<VaultItemMeta>}
     */
    postItem(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataString = JSON.stringify(data);
            const dataToPost = this._usesEncryption ? JSON.stringify(encrypt(dataString, this.publicKey)) : dataString;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmF1bGl0Zmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92YXVsaXRmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQWlCNUMsQ0FBQztBQUlGLE1BQU0sY0FBYztJQU1sQixZQUNVLE9BQWUsRUFDZixJQUFZO1FBRFosWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLFNBQUksR0FBSixJQUFJLENBQVE7UUFXdEIsWUFBTyxHQUFHLENBQUMsTUFBZSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxHQUFHLElBQUksQ0FBQyxPQUFPLGNBQWMsTUFBTSxVQUFVLENBQUMsQ0FBQztZQUMvQyxHQUFHLElBQUksQ0FBQyxPQUFPLGNBQWMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDO1FBWC9DLElBQUksSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDeEMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsT0FBTyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLE9BQU8sY0FBYyxJQUFJLFFBQVEsQ0FBQztRQUNyRCxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsT0FBTyxjQUFjLElBQUksVUFBVSxDQUFDO1FBQ3hELElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxPQUFPLG9CQUFvQixDQUFDO0lBQ25ELENBQUM7Q0FLRjtBQUVELE1BQU0sT0FBTyxVQUFVO0lBT3JCOzs7OztPQUtHO0lBQ0gsWUFDUyxPQUFlLEVBQ2YsSUFBWSxFQUNaLFdBQThCO1FBRjlCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1FBc0gvQix1QkFBa0IsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7UUFwSG5GLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxjQUFjLENBQzVCLE9BQU8sRUFDUCxJQUFJLENBQ0wsQ0FBQztRQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7O09BSUc7SUFDRyxVQUFVOztZQUNkLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFRDs7Ozs7O09BTUc7SUFDRyxvQkFBb0IsQ0FBQyxRQUFRLEdBQUcsSUFBSTs7WUFDeEMsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osSUFBSTtvQkFDRixNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM5RSxJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBRW5ELFFBQVE7b0JBQ1IsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNuRixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBRWhDLE9BQU87aUJBQ1I7Z0JBQ0QsUUFBUSxLQUFLLElBQVAsRUFBRSxLQUFLLEVBQUU7YUFDaEI7WUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUUzQiwrRUFBK0U7UUFDakYsQ0FBQztLQUFBO0lBRUQsSUFBWSxlQUFlLEtBQWMsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRTNHOzs7Ozs7T0FNRztJQUNHLFFBQVEsQ0FBQyxJQUFTOztZQUN0QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztZQUVySCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUvRSxPQUFPLEdBQUcsQ0FBQyxJQUFxQixDQUFDO1FBQ25DLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDRyxPQUFPLENBQUMsTUFBYzs7WUFDMUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6RSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBaUIsQ0FBQztZQUVuQyxJQUFJO2dCQUNGLHdFQUF3RTtnQkFDeEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNyQztZQUFDLFFBQVEsS0FBSyxJQUFQLEVBQUUsS0FBSyxFQUFFO1lBRWpCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNHLFFBQVE7O1lBQ1osTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25FLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFhLENBQUM7WUFFL0Isd0VBQXdFO1lBQ3hFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN2QixJQUFJO29CQUNGLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDekI7Z0JBQUMsUUFBUSxLQUFLLElBQVAsRUFBRSxLQUFLLEVBQUU7Z0JBRWpCLE9BQU8sSUFBSSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNILE9BQU87O1FBQ0wsSUFBSTtZQUNGLHVCQUF1QjtZQUN2QixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdkI7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxRQUFDLElBQUksQ0FBQyxXQUFXLDBDQUFFLE1BQU0sQ0FBQSxJQUFJLFFBQUMsSUFBSSxDQUFDLFdBQVcsMENBQUUsU0FBUyxDQUFBO1lBQ3pFLE9BQU8sS0FBSyxDQUFDO1FBRWYsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFJRDs7Ozs7OztPQU9HO0lBQ0csa0JBQWtCLENBQUMsSUFBWTs7WUFDbkMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRW5GLElBQUksQ0FBQyxXQUFXLEdBQUc7Z0JBQ2pCLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBYTtnQkFDMUIsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFnQjthQUNqQyxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzFCLENBQUM7S0FBQTtJQUVhLFVBQVU7OztZQUN0QixJQUFJLEtBQWEsQ0FBQztZQUVsQixJQUFJO2dCQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ25GLFdBQVcsUUFBRSxJQUFJLENBQUMsV0FBVywwQ0FBRSxNQUFNO29CQUNyQyxlQUFlLFFBQUUsSUFBSSxDQUFDLFdBQVcsMENBQUUsU0FBUztvQkFDNUMsWUFBWSxFQUFFLG9CQUFvQjtpQkFDbkMsQ0FBQyxDQUFDLENBQUM7Z0JBRUosS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFXLENBQUM7YUFDakQ7WUFDRCxXQUFNO2dCQUNKLE1BQU0sSUFBSSxpQkFBaUIsRUFBRSxDQUFDO2FBQy9CO1lBRUQsT0FBTyxLQUFLLENBQUM7O0tBQ2Q7O0FBRUQsc0JBQXNCO0FBRXRCOzs7Ozs7R0FNRztBQUNJLDRCQUFpQixHQUFHLENBQUMsR0FBRyxJQUFtQixFQUFVLEVBQUUsQ0FDNUQsSUFBSTtJQUNGLHVCQUF1QjtLQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyJ9