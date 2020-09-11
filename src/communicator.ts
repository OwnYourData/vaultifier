import axios, { AxiosResponse } from "axios";

import { UnauthorizedError } from "./errors";

interface BaseHeaders {
  'Content-Type': string,
}

interface DataHeaders extends BaseHeaders {
  'Accept': string,
  'Authorization': string,
}

export class Communicator {
  private token?: string;

  constructor(
    public tokenCallback: () => Promise<string | undefined>,
  ) { }

  async refreshToken(): Promise<string | undefined> {
    return this.token = await this.tokenCallback();
  }

  isValid(): boolean {
    return !!this.token;
  }

  async get(url: string, usesAuth = false): Promise<AxiosResponse> {
    return this._placeNetworkCall(async () => axios.get(url, {
      headers: this._getHeaders(usesAuth),
    }), usesAuth);
  }

  async post(url: string, usesAuth = false, data: string): Promise<AxiosResponse> {
    return this._placeNetworkCall(async () => axios.post(url, data, {
      headers: this._getHeaders(usesAuth),
    }), usesAuth);
  }

  private async _placeNetworkCall(callable: () => Promise<AxiosResponse>, isAuthenticated = false) {
    let response: AxiosResponse;

    if (isAuthenticated) {
      response = await callable();

      // if data vault responds with a 403, our token is expired
      // therefore we fetch a new one and give the call another try
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

  private _getHeaders(usesAuth = false): BaseHeaders {
    return usesAuth ?
      this._getDataHeaders() :
      this._baseHeaders;
  }

  private _baseHeaders: BaseHeaders = {
    'Content-Type': 'application/json',
  }

  private _getDataHeaders(): DataHeaders {
    return {
      ...this._baseHeaders,
      Accept: '*/*',
      Authorization: `Bearer ${this.token}`,
    };
  }
}