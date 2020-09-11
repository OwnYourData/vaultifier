import sodium from 'libsodium-wrappers';

const hexStringToByte = (value: string) => {
  if (!value) {
    return new Uint8Array();
  }
  const a = [];
  for (let i = 0, len = value.length; i < len; i += 2) {
    a.push(parseInt(value.substr(i, 2), 16));
  }
  return new Uint8Array(a);
}

const createSha256Hex = async (value: string): Promise<string> => {
  // browser environment
  if (typeof globalThis.crypto !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const msgBuffer = new TextEncoder('utf-8').encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');

    return hashHex;
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

const sharedSecret = 'auth';
// the hash is created globally, so we don't use computing power to recreate it over and over
const sharedSecretHash = createSha256Hex(sharedSecret);

export const encrypt = async (text: string, publicKey: string) => {
  const nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES));
  const cipherMsg = sodium.crypto_box_easy(
    Buffer.from(text),
    nonce,
    Buffer.from(hexStringToByte(publicKey)),
    Buffer.from(hexStringToByte(await sharedSecretHash)),
  );

  return {
    value: Buffer.from(cipherMsg).toString('hex'),
    nonce: nonce.toString('hex'),
    version: '0.4',
  };
}

// SEE: https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
export const decrypt = async (text: string, cipher: string, nonce: string) => {
  const passwordHash = await createSha256Hex(cipher);
  const privateKeyHash = await sharedSecretHash;

  const decrypted = sodium.crypto_box_open_easy(
    text,
    Buffer.from(nonce),
    sodium.crypto_scalarmult_base(Buffer.from(privateKeyHash)),
    Buffer.from(passwordHash),
  );

  return decrypted;
}