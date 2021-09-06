import _canonicalize from 'canonicalize';
// @ts-expect-error hashlink has no types
import { encode } from 'hashlink';
import sodium, { from_hex, from_string, to_hex, to_string } from 'libsodium-wrappers';

import { onlyContainsHex } from './utils/core-utils';

export const canonicalize = _canonicalize;

export interface CryptoObject {
  value: string,
  nonce: string,
  version?: string,
}

export interface CipherObject {
  cipher: string,
  isHashed?: boolean,
}

export const createSha256Hex = async (value: string): Promise<string> => {
  // browser environment
  if (typeof globalThis.crypto !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const msgBuffer = new TextEncoder('utf-8').encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    return to_hex(new Uint8Array(hashBuffer));
  }
  // node environment
  else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');

    return crypto.createHash('sha256')
      .update(value)
      .digest('hex');
  }
}

const cryptoVersion = '0.4';
const sharedSecret = 'auth';
// the hash is created globally, so we don't use computing power to recreate it over and over
const sharedSecretHash = createSha256Hex(sharedSecret);

export const encrypt = async (text: string, publicKey: string): Promise<CryptoObject> => {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const cipherMsg = sodium.crypto_box_easy(
    from_string(text),
    nonce,
    from_hex(publicKey),
    from_hex(await sharedSecretHash),
  );

  return {
    value: to_hex(cipherMsg),
    nonce: to_hex(nonce),
    version: cryptoVersion,
  };
}

// SEE: https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
export const decrypt = async (cryptoObject: CryptoObject, cipherObject: CipherObject): Promise<string> => {
  const { value, nonce, version } = cryptoObject;
  const { cipher } = cipherObject;
  let { isHashed } = cipherObject;

  if (isHashed === undefined)
    isHashed = false;

  if (!!version && version !== cryptoVersion)
    throw new Error(`The provided crypto version (${version}) does not match our internal crypto version (${cryptoVersion})`);

  const _text = from_hex(value);
  const _nonce = from_hex(nonce);
  const _privKey = from_hex(await sharedSecretHash);
  // calculates the our private key's public key
  const _pubKey = sodium.crypto_scalarmult_base(_privKey);
  const _cipher = from_hex(isHashed ? cipher : await createSha256Hex(cipher));

  const decrypted = sodium.crypto_box_open_easy(
    _text,
    _nonce,
    _pubKey,
    _cipher,
  );

  return to_string(decrypted);
}

export const isEncrypted = (item: any): boolean => {
  return !!(item.value &&
    onlyContainsHex(item.value) &&
    item.nonce &&
    onlyContainsHex(item.nonce) &&
    item.version);
}

const alpha = 'abcdefghijklmnopqrstuvwxyz';
const numeric = '1234567890';

const allowedChars = `${alpha}${alpha.toUpperCase()}${numeric}`;

export const getRandomString = (size: number) => {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(allowedChars.charAt(Math.floor(Math.random() * allowedChars.length)));
  }

  return arr.join('');
}

const codecs = ['mh-sha2-256', 'mb-base58-btc'];
export const generateHashlink = async (data: any, urls: any = undefined, meta: any = undefined): Promise<string> => {
  if (typeof data === 'object')
    data = canonicalize(data);

  const hl: string = await encode({
    data: (new TextEncoder()).encode(data),
    urls,
    codecs,
    meta
  });

  return hl.split(':')[1];
}