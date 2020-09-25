export declare const encrypt: (text: string, publicKey: string) => Promise<{
    value: string;
    nonce: string;
    version: string;
}>;
export declare const decrypt: (text: string, cipher: string, nonce: string) => Promise<Uint8Array>;
