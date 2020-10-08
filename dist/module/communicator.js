var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import { UnauthorizedError } from "./errors";
;
export class Communicator {
    constructor(tokenCallback) {
        this.tokenCallback = tokenCallback;
        this.setNetworkAdapter = (adapter) => {
            if (adapter)
                return this.networkAdapter = adapter;
            else // default implementation
                return this.networkAdapter = {
                    get: (url, headers) => axios.get(url, {
                        headers: headers,
                    }),
                    post: (url, data, headers) => axios.post(url, data, {
                        headers: headers,
                    }),
                    delete: (url, headers) => axios.delete(url, {
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
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.token = yield this.tokenCallback();
        });
    }
    isValid() {
        return !!this.token;
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
                if (response.status === 403) {
                    this.token = yield this.refreshToken();
                    response = yield callable();
                }
            }
            else
                response = yield callable();
            if (response.status >= 400) {
                // TODO: better error handling
                throw new UnauthorizedError();
            }
            return response;
        });
    }
    _getHeaders(usesAuth = false) {
        return usesAuth ?
            this._getDataHeaders() :
            this._baseHeaders;
    }
    _getDataHeaders() {
        if (this.token === undefined)
            throw new Error('There is no token available. Did you forget to initalize vaultifier?');
        return Object.assign(Object.assign({}, this._baseHeaders), { Accept: '*/*', Authorization: `Bearer ${this.token}` });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEtBQXdCLE1BQU0sT0FBTyxDQUFDO0FBRTdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQW9DNUMsQ0FBQztBQUVGLE1BQU0sT0FBTyxZQUFZO0lBSXZCLFlBQ1MsYUFBZ0Q7UUFBaEQsa0JBQWEsR0FBYixhQUFhLENBQW1DO1FBTXpELHNCQUFpQixHQUFHLENBQUMsT0FBd0IsRUFBa0IsRUFBRTtZQUMvRCxJQUFJLE9BQU87Z0JBQ1QsT0FBTyxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztpQkFDbEMseUJBQXlCO2dCQUM1QixPQUFPLElBQUksQ0FBQyxjQUFjLEdBQUc7b0JBQzNCLEdBQUcsRUFBRSxDQUFDLEdBQVcsRUFBRSxPQUFhLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO3dCQUNsRCxPQUFPLEVBQUUsT0FBTztxQkFDakIsQ0FBQztvQkFDRixJQUFJLEVBQUUsQ0FBQyxHQUFXLEVBQUUsSUFBVSxFQUFFLE9BQWEsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO3dCQUN0RSxPQUFPLEVBQUUsT0FBTztxQkFDakIsQ0FBQztvQkFDRixNQUFNLEVBQUUsQ0FBQyxHQUFXLEVBQUUsT0FBYSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTt3QkFDeEQsT0FBTztxQkFDUixDQUFDO2lCQUNILENBQUE7UUFDTCxDQUFDLENBQUE7UUE2RE8saUJBQVksR0FBZ0I7WUFDbEMsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQyxDQUFBO1FBbEZDLDZCQUE2QjtRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FB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