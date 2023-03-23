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

interface NetworkResponseObject {
  response?: NetworkResponse;
  error?: Error;
}

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

  private async tryCatch(callable: () => Promise<NetworkResponse>): Promise<NetworkResponseObject> {
    try {
      const response = await callable();
      return {
        response,
      };
    } catch (e: any) {
      return {
        error: e,
        response: e.response,
      };
    }
  }

  private async _placeNetworkCall(
    callable: () => Promise<NetworkResponse>,
    isAuthenticated = false,
    recursionCount = 0,
  ): Promise<NetworkResponse> {
    let nro: NetworkResponseObject = await this.tryCatch(callable);

    if (!nro.response)
      throw nro.error ? nro.error : new Error('No network response');

    // only try to refresh authentication, if recursion count is still 0
    // otherwise we'll end up in an infinite loop
    if (isAuthenticated && recursionCount === 0) {
      // if data container responds with a 401, our token is expired
      // therefore we fetch a new one and give the call another try
      if (nro.response.status === 401 && this._usesAuthentication()) {
        this.token = await this.refreshToken();
        nro = await this.tryCatch(callable);

        return this._placeNetworkCall(callable, isAuthenticated, recursionCount + 1);
      }
    }

    if (nro.response.status === 401) {
      throw new UnauthorizedError();
    } else if (nro.response.status >= 400) {
      throw nro.error;
    }

    return nro.response;
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