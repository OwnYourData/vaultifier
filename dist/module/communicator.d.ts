import { AxiosResponse } from "axios";
export declare class Communicator {
    tokenCallback: () => Promise<string | undefined>;
    private token?;
    constructor(tokenCallback: () => Promise<string | undefined>);
    refreshToken(): Promise<string | undefined>;
    isValid(): boolean;
    get(url: string, usesAuth?: boolean): Promise<AxiosResponse>;
    post(url: string, usesAuth: boolean | undefined, data: string): Promise<AxiosResponse>;
    private _placeNetworkCall;
    private _getHeaders;
    private _getBaseHeaders;
    private _getDataHeaders;
}
