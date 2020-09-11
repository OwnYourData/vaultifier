import axios from "axios";
import { UnauthorizedError } from "./errors";
export class Communicator {
    constructor(tokenCallback) {
        this.tokenCallback = tokenCallback;
    }
    async refreshToken() {
        return this.token = await this.tokenCallback();
    }
    isValid() {
        return !!this.token;
    }
    async get(url, usesAuth = false) {
        return this._placeNetworkCall(async () => axios.get(url, {
            headers: this._getHeaders(usesAuth),
        }), usesAuth);
    }
    async post(url, usesAuth = false, data) {
        return this._placeNetworkCall(async () => axios.post(url, data, {
            headers: this._getHeaders(usesAuth),
        }), usesAuth);
    }
    async _placeNetworkCall(callable, isAuthenticated = false) {
        let response;
        if (isAuthenticated) {
            response = await callable();
            if (response.status === 403) {
                this.token = await this.refreshToken();
                response = await callable();
            }
        }
        else
            response = await callable();
        if (response.status >= 400) {
            // TODO: better error handling
            throw new UnauthorizedError();
        }
        return response;
    }
    _getHeaders(usesAuth = false) {
        return usesAuth ?
            this._getDataHeaders() :
            this._getBaseHeaders();
    }
    _getBaseHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }
    _getDataHeaders() {
        return {
            ...this._getBaseHeaders(),
            Accept: '*/*',
            Authorization: `Bearer ${this.token}`,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbXVuaWNhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW11bmljYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQXdCLE1BQU0sT0FBTyxDQUFDO0FBRTdDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQVc3QyxNQUFNLE9BQU8sWUFBWTtJQUd2QixZQUNTLGFBQWdEO1FBQWhELGtCQUFhLEdBQWIsYUFBYSxDQUFtQztJQUNyRCxDQUFDO0lBRUwsS0FBSyxDQUFDLFlBQVk7UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFXLEVBQUUsUUFBUSxHQUFHLEtBQUs7UUFDckMsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUN2RCxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7U0FDcEMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVcsRUFBRSxRQUFRLEdBQUcsS0FBSyxFQUFFLElBQVk7UUFDcEQsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7WUFDOUQsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO1NBQ3BDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBRU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQXNDLEVBQUUsZUFBZSxHQUFHLEtBQUs7UUFDN0YsSUFBSSxRQUF1QixDQUFDO1FBRTVCLElBQUksZUFBZSxFQUFFO1lBQ25CLFFBQVEsR0FBRyxNQUFNLFFBQVEsRUFBRSxDQUFDO1lBRTVCLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3ZDLFFBQVEsR0FBRyxNQUFNLFFBQVEsRUFBRSxDQUFDO2FBQzdCO1NBQ0Y7O1lBRUMsUUFBUSxHQUFHLE1BQU0sUUFBUSxFQUFFLENBQUM7UUFFOUIsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRTtZQUMxQiw4QkFBOEI7WUFDOUIsTUFBTSxJQUFJLGlCQUFpQixFQUFFLENBQUM7U0FDL0I7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU8sV0FBVyxDQUFDLFFBQVEsR0FBRyxLQUFLO1FBQ2xDLE9BQU8sUUFBUSxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVPLGVBQWU7UUFDckIsT0FBTztZQUNMLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkMsQ0FBQztJQUNKLENBQUM7SUFFTyxlQUFlO1FBQ3JCLE9BQU87WUFDTCxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDekIsTUFBTSxFQUFFLEtBQUs7WUFDYixhQUFhLEVBQUUsVUFBVSxJQUFJLENBQUMsS0FBSyxFQUFFO1NBQ3RDLENBQUM7SUFDSixDQUFDO0NBQ0YifQ==