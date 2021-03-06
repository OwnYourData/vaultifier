import axios, { AxiosResponse } from "axios";

import { UnauthorizedError } from "./errors";

interface BaseHeaders {
  'Content-Type': string,
}

interface DataHeaders extends BaseHeaders {
  'Accept': string,
  'Authorization': string,
}

export type NetworkResponse =
  Pick<
    AxiosResponse,
    'data' |
    'headers' |
    'request' |
    'status'
  >

export interface NetworkAdapter {
  get: (
    url: string,
    headers?: any,
  ) => Promise<NetworkResponse>;

  post: (
    url: string,
    data?: any,
    headers?: any,
  ) => Promise<NetworkResponse>;

  put: (
    url: string,
    data?: any,
    headers?: any,
  ) => Promise<NetworkResponse>;

  delete: (
    url: string,
    headers?: any
  ) => Promise<NetworkResponse>
};

export class Communicator {
  private token?: string;
  private networkAdapter: NetworkAdapter;
  private tokenCallback?: () => Promise<string>;

  constructor() {
    // set default implementation
    this.networkAdapter = this.setNetworkAdapter();
  }

  private _usesAuthentication(): boolean {
    return !!this.tokenCallback;
  }

  setTokenCallback = (callback: () => Promise<string>) => {
    this.tokenCallback = callback;
  }

  setNetworkAdapter = (adapter?: NetworkAdapter): NetworkAdapter => {
    if (adapter)
      return this.networkAdapter = adapter;
    else // default implementation
      return this.networkAdapter = {
        get: (url: string, headers?: any) => axios.get(url, {
          headers: headers,
        }),
        post: (url: string, data?: any, headers?: any) => axios.post(url, data, {
          headers: headers,
        }),
        put: (url: string, data?: any, headers?: any) => axios.put(url, data, {
          headers: headers,
        }),
        delete: (url: string, headers?: any) => axios.delete(url, {
          headers,
        }),
      }
  }

  async refreshToken(): Promise<string | undefined> {
    if (this.tokenCallback)
      return this.token = await this.tokenCallback();

    return undefined;
  }

  hasToken(): boolean {
    return !!this.token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  async get(url: string, usesAuth = false): Promise<NetworkResponse> {
    return this._placeNetworkCall(
      async () => this.networkAdapter.get(url, this._getHeaders(usesAuth)),
      usesAuth
    );
  }

  async post(url: string, usesAuth = false, data?: any): Promise<NetworkResponse> {
    return this._placeNetworkCall(
      async () => this.networkAdapter.post(url, data, this._getHeaders(usesAuth)),
      usesAuth
    );
  }

  async put(url: string, usesAuth = false, data?: any): Promise<NetworkResponse> {
    return this._placeNetworkCall(
      async () => this.networkAdapter.put(url, data, this._getHeaders(usesAuth)),
      usesAuth
    );
  }

  async delete(url: string, usesAuth = false): Promise<NetworkResponse> {
    return this._placeNetworkCall(
      async () => this.networkAdapter.delete(url, this._getHeaders(usesAuth)),
      usesAuth,
    );
  }

  private async tryCatch(callable: () => Promise<NetworkResponse>) {
    try {
      const response = await callable();
      return response;
    } catch (e) {
      return e.response;
    }
  }

  private async _placeNetworkCall(callable: () => Promise<NetworkResponse>, isAuthenticated = false) {
    let response: NetworkResponse;

    if (isAuthenticated) {
      response = await this.tryCatch(callable);

      // if data vault responds with a 401, our token is expired
      // therefore we fetch a new one and give the call another try
      if (response.status === 401 && this._usesAuthentication()) {
        this.token = await this.refreshToken();
        response = await this.tryCatch(callable);
      }
    }
    else
      response = await this.tryCatch(callable);

    if (response.status >= 400) {
      // TODO: better error handling
      throw new UnauthorizedError();
    }

    return response;
  }

  private _getHeaders(usesAuth = false): BaseHeaders {
    return usesAuth && this._usesAuthentication() ?
      this._getDataHeaders() :
      this._baseHeaders;
  }

  private _baseHeaders: BaseHeaders = {
    'Content-Type': 'application/json',
  }

  private _getDataHeaders(): DataHeaders {
    if (this.token === undefined)
      throw new Error('There is no token available. Did you forget to initalize vaultifier?')

    return {
      ...this._baseHeaders,
      Accept: '*/*',
      Authorization: `Bearer ${this.token}`,
    };
  }
}