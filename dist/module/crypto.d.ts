export interface CryptoObject {
    value: string;
    nonce: string;
    version?: string;
}
export interface CipherObject {
    cipher: string;
    isHashed?: boolean;
}
export declare const encrypt: (text: string, publicKey: string) => Promise<CryptoObject>;
export declare const decrypt: (cryptoObject: CryptoObject, cipherObject: CipherObject) => Promise<string>;
export declare const isEncrypted: (item: any) => boolean;
