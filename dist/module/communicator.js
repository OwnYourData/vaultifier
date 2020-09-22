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
export class Communicator {
    constructor(tokenCallback) {
        this.tokenCallback = tokenCallback;
        this._baseHeaders = {
            'Content-Type': 'application/json',
        };
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
            return this._placeNetworkCall(() => __awaiter(this, void 0, void 0, function* () {
                return axios.get(url, {
                    headers: this._getHeaders(usesAuth),
                });
            }), usesAuth);
        });
    }
    post(url, usesAuth = false, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._placeNetworkCall(() => __awaiter(this, void 0, void 0, function* () {
                return axios.post(url, data, {
                    headers: this._getHeaders(usesAuth),
                });
            }), usesAuth);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEtBQXdCLE1BQU0sT0FBTyxDQUFDO0FBRTdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVc3QyxNQUFNLE9BQU8sWUFBWTtJQUd2QixZQUNTLGFBQWdEO1FBQWhELGtCQUFhLEdBQWIsYUFBYSxDQUFtQztRQXFEakQsaUJBQVksR0FBZ0I7WUFDbEMsY0FBYyxFQUFFLGtCQUFrQjtTQUNuQyxDQUFBO0lBdERHLENBQUM7SUFFQyxZQUFZOztZQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDakQsQ0FBQztLQUFBO0lBRUQsT0FBTztRQUNMLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVLLEdBQUcsQ0FBQyxHQUFXLEVBQUUsUUFBUSxHQUFHLEtBQUs7O1lBQ3JDLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQVMsRUFBRTtnQkFBQyxPQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO29CQUN2RCxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7aUJBQ3BDLENBQUMsQ0FBQTtjQUFBLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDaEIsQ0FBQztLQUFBO0lBRUssSUFBSSxDQUFDLEdBQVcsRUFBRSxRQUFRLEdBQUcsS0FBSyxFQUFFLElBQVk7O1lBQ3BELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQVMsRUFBRTtnQkFBQyxPQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtvQkFDOUQsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO2lCQUNwQyxDQUFDLENBQUE7Y0FBQSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVhLGlCQUFpQixDQUFDLFFBQXNDLEVBQUUsZUFBZSxHQUFHLEtBQUs7O1lBQzdGLElBQUksUUFBdUIsQ0FBQztZQUU1QixJQUFJLGVBQWUsRUFBRTtnQkFDbkIsUUFBUSxHQUFHLE1BQU0sUUFBUSxFQUFFLENBQUM7Z0JBRTVCLDBEQUEwRDtnQkFDMUQsNkRBQTZEO2dCQUM3RCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO29CQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO29CQUN2QyxRQUFRLEdBQUcsTUFBTSxRQUFRLEVBQUUsQ0FBQztpQkFDN0I7YUFDRjs7Z0JBRUMsUUFBUSxHQUFHLE1BQU0sUUFBUSxFQUFFLENBQUM7WUFFOUIsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRTtnQkFDMUIsOEJBQThCO2dCQUM5QixNQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQzthQUMvQjtZQUVELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7S0FBQTtJQUVPLFdBQVcsQ0FBQyxRQUFRLEdBQUcsS0FBSztRQUNsQyxPQUFPLFFBQVEsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBTU8sZUFBZTtRQUNyQix1Q0FDSyxJQUFJLENBQUMsWUFBWSxLQUNwQixNQUFNLEVBQUUsS0FBSyxFQUNiLGFBQWEsRUFBRSxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFDckM7SUFDSixDQUFDO0NBQ0YifQ==