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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Communicator = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("./errors");
;
class Communicator {
    constructor() {
        this.setTokenCallback = (callback) => {
            this.tokenCallback = callback;
        };
        this.setNetworkAdapter = (adapter) => {
            if (adapter)
                return this.networkAdapter = adapter;
            else // default implementation
                return this.networkAdapter = {
                    get: (url, headers) => axios_1.default.get(url, {
                        headers: headers,
                    }),
                    post: (url, data, headers) => axios_1.default.post(url, data, {
                        headers: headers,
                    }),
                    delete: (url, headers) => axios_1.default.delete(url, {
                        headers,
                    }),
                };
        };
        this._baseHeaders = {
            'Content-Type': 'application/json',
        };
        // set default implementation
        this.networkAdapter = this.setNetworkAdapter();
    }
    _usesAuthentication() {
        return !!this.tokenCallback;
    }
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tokenCallback)
                return this.token = yield this.tokenCallback();
            return undefined;
        });
    }
    isValid() {
        return (this._usesAuthentication() && !!this.token) || !this.token;
    }
    get(url, usesAuth = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._placeNetworkCall(() => __awaiter(this, void 0, void 0, function* () { return this.networkAdapter.get(url, this._getHeaders(usesAuth)); }), usesAuth);
        });
    }
    post(url, usesAuth = false, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._placeNetworkCall(() => __awaiter(this, void 0, void 0, function* () { return this.networkAdapter.post(url, data, this._getHeaders(usesAuth)); }), usesAuth);
        });
    }
    delete(url, usesAuth = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._placeNetworkCall(() => __awaiter(this, void 0, void 0, function* () { return this.networkAdapter.delete(url, this._getHeaders(usesAuth)); }), usesAuth);
        });
    }
    _placeNetworkCall(callable, isAuthenticated = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            if (isAuthenticated) {
                response = yield callable();
                // if data vault responds with a 403, our token is expired
                // therefore we fetch a new one and give the call another try
                if (response.status === 403 && this._usesAuthentication()) {
                    this.token = yield this.refreshToken();
                    response = yield callable();
                }
            }
            else
                response = yield callable();
            if (response.status >= 400) {
                // TODO: better error handling
                throw new errors_1.UnauthorizedError();
            }
            return response;
        });
    }
    _getHeaders(usesAuth = false) {
        return usesAuth && this._usesAuthentication() ?
            this._getDataHeaders() :
            this._baseHeaders;
    }
    _getDataHeaders() {
        if (this.token === undefined)
            throw new Error('There is no token available. Did you forget to initalize vaultifier?');
        return Object.assign(Object.assign({}, this._baseHeaders), { Accept: '*/*', Authorization: `Bearer ${this.token}` });
    }
}
exports.Communicator = Communicator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBNkM7QUFFN0MscUNBQTZDO0FBb0M1QyxDQUFDO0FBRUYsTUFBYSxZQUFZO0lBS3ZCO1FBU0EscUJBQWdCLEdBQUcsQ0FBQyxRQUErQixFQUFFLEVBQUU7WUFDckQsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7UUFDaEMsQ0FBQyxDQUFBO1FBRUQsc0JBQWlCLEdBQUcsQ0FBQyxPQUF3QixFQUFrQixFQUFFO1lBQy9ELElBQUksT0FBTztnQkFDVCxPQUFPLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO2lCQUNsQyx5QkFBeUI7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDLGNBQWMsR0FBRztvQkFDM0IsR0FBRyxFQUFFLENBQUMsR0FBVyxFQUFFLE9BQWEsRUFBRSxFQUFFLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7d0JBQ2xELE9BQU8sRUFBRSxPQUFPO3FCQUNqQixDQUFDO29CQUNGLElBQUksRUFBRSxDQUFDLEdBQVcsRUFBRSxJQUFVLEVBQUUsT0FBYSxFQUFFLEVBQUUsQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7d0JBQ3RFLE9BQU8sRUFBRSxPQUFPO3FCQUNqQixDQUFDO29CQUNGLE1BQU0sRUFBRSxDQUFDLEdBQVcsRUFBRSxPQUFhLEVBQUUsRUFBRSxDQUFDLGVBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO3dCQUN4RCxPQUFPO3FCQUNSLENBQUM7aUJBQ0gsQ0FBQTtRQUNMLENBQUMsQ0FBQTtRQWdFTyxpQkFBWSxHQUFnQjtZQUNsQyxjQUFjLEVBQUUsa0JBQWtCO1NBQ25DLENBQUE7UUE3RkMsNkJBQTZCO1FBQzdCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxD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