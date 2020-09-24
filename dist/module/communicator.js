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
        return Object.assign(Object.assign({}, this._baseHeaders), { Accept: '*/*', Authorization: `Bearer ${this.token}` });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEtBQXdCLE1BQU0sT0FBTyxDQUFDO0FBRTdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQStCNUMsQ0FBQztBQUVGLE1BQU0sT0FBTyxZQUFZO0lBSXZCLFlBQ1MsYUFBZ0Q7UUFBaEQsa0JBQWEsR0FBYixhQUFhLENBQW1DO1FBTXpELHNCQUFpQixHQUFHLENBQUMsT0FBd0IsRUFBa0IsRUFBRTtZQUMvRCxJQUFJLE9BQU87Z0JBQ1QsT0FBTyxJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztpQkFDbEMseUJBQXlCO2dCQUM1QixPQUFPLElBQUksQ0FBQyxjQUFjLEdBQUc7b0JBQzNCLEdBQUcsRUFBRSxDQUFDLEdBQVcsRUFBRSxPQUFhLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO3dCQUNsRCxPQUFPLEVBQUUsT0FBTztxQkFDakIsQ0FBQztvQkFDRixJQUFJLEVBQUUsQ0FBQyxHQUFXLEVBQUUsSUFBVSxFQUFFLE9BQWEsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO3dCQUN0RSxPQUFPLEVBQUUsT0FBTztxQkFDakIsQ0FBQztpQkFDSCxDQUFBO1FBQ0wsQ0FBQyxDQUFBO1FBc0RPLGlCQUFZLEdBQWdCO1lBQ2xDLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkMsQ0FBQTtRQXhFQyw2QkFBNkI7UUFDN0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBZ0JLLFlBQVk7O1lBQ2hCLE9BQU8sSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNqRCxDQUFDO0tBQUE7SUFFRCxPQUFPO1FBQ0wsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUssR0FBRyxDQUFDLEdBQVcsRUFBRSxRQUFRLEdBQUcsS0FBSzs7WUFDckMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQzNCLEdBQVMsRUFBRSxnREFBQyxPQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUEsR0FBQSxFQUNwRSxRQUFRLENBQ1QsQ0FBQztRQUNKLENBQUM7S0FBQTtJQUVLLElBQUksQ0FBQyxHQUFXLEVBQUUsUUFBUSxHQUFHLEtBQUssRUFBRSxJQUFZOztZQUNwRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FDM0IsR0FBUyxFQUFFLGdEQUFDLE9BQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUEsR0FBQSxFQUMzRSxRQUFRLENBQ1QsQ0FBQztRQUNKLENBQUM7S0FBQTtJQUVhLGlCQUFpQixDQUFDLFFBQXdDLEVBQUUsZUFBZSxHQUFHLEtBQUs7O1lBQy9GLElBQUksUUFBeUIsQ0FBQztZQUU5QixJQUFJLGVBQWUsRUFBRTtnQkFDbkIsUUFBUSxHQUFHLE1BQU0sUUFBUSxFQUFFLENBQUM7Z0JBRTVCLDBEQUEwRDtnQkFDMUQsNkRBQTZEO2dCQUM3RCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO29CQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN2QyxRQUFRLEdBQUcsTUFBTSxRQUFRLEVBQUUsQ0FBQztpQkFDN0I7YUFDRjs7Z0JBRUMsUUFBUSxHQUFHLE1BQU0sUUFBUSxFQUFFLENBQUM7WUFFOUIsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRTtnQkFDMUIsOEJBQThCO2dCQUM5QixNQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQzthQUMvQjtZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUVPLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSztRQUNsQyxPQUFPLFFBQVEsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBTU8sZUFBZTtRQUNyQix1Q0FDSyxJQUFJLENBQUMsWUFBWSxLQUNwQixNQUFNLEVBQUUsS0FBSyxFQUNiLGFBQWEsRUFBRSxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFDckM7SUFDSixDQUFDO0NBQ0YifQ==