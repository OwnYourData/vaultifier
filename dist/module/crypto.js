var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sodium, { from_hex, from_string, to_hex, to_string } from 'libsodium-wrappers';
import { onlyContainsHex } from './utils/core-utils';
const createSha256Hex = (value) => __awaiter(void 0, void 0, void 0, function* () {
    // browser environment
    if (typeof globalThis.crypto !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const msgBuffer = new TextEncoder('utf-8').encode(value);
        const hashBuffer = yield crypto.subtle.digest('SHA-256', msgBuffer);
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
});
const cryptoVersion = '0.4';
const sharedSecret = 'auth';
// the hash is created globally, so we don't use computing power to recreate it over and over
const sharedSecretHash = createSha256Hex(sharedSecret);
export const encrypt = (text, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const cipherMsg = sodium.crypto_box_easy(from_string(text), nonce, from_hex(publicKey), from_hex(yield sharedSecretHash));
    return {
        value: to_hex(cipherMsg),
        nonce: to_hex(nonce),
        version: cryptoVersion,
    };
});
// SEE: https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
export const decrypt = (cryptoObject, cipherObject) => __awaiter(void 0, void 0, void 0, function* () {
    const { value, nonce, version } = cryptoObject;
    const { cipher } = cipherObject;
    let { isHashed } = cipherObject;
    if (isHashed === undefined)
        isHashed = false;
    if (!!version && version !== cryptoVersion)
        throw new Error(`The provided crypto version (${version}) does not match our internal crypto version (${cryptoVersion})`);
    const _text = from_hex(value);
    const _nonce = from_hex(nonce);
    const _privKey = from_hex(yield sharedSecretHash);
    // calculates the our private key's public key
    const _pubKey = sodium.crypto_scalarmult_base(_privKey);
    const _cipher = from_hex(isHashed ? cipher : yield createSha256Hex(cipher));
    const decrypted = sodium.crypto_box_open_easy(_text, _nonce, _pubKey, _cipher);
    return to_string(decrypted);
});
export const isEncrypted = (item) => {
    return !!(item.value &&
        onlyContainsHex(item.value) &&
        item.nonce &&
        onlyContainsHex(item.nonce) &&
        item.version);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NyeXB0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWFyRCxNQUFNLGVBQWUsR0FBRyxDQUFPLEtBQWEsRUFBbUIsRUFBRTtJQUMvRCxzQkFBc0I7SUFDdEIsSUFBSSxPQUFPLFVBQVUsQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO1FBQzVDLDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXBFLE9BQU8sTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7S0FDM0M7SUFDRCxtQkFBbUI7U0FDZDtRQUNILDhEQUE4RDtRQUM5RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFakMsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQzthQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ2IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFBLENBQUE7QUFFRCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDNUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDO0FBQzVCLDZGQUE2RjtBQUM3RixNQUFNLGdCQUFnQixHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUV2RCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBTyxJQUFZLEVBQUUsU0FBaUIsRUFBeUIsRUFBRTtJQUN0RixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25FLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQ3RDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDakIsS0FBSyxFQUNMLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFDbkIsUUFBUSxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FDakMsQ0FBQztJQUVGLE9BQU87UUFDTCxLQUFLLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNwQixPQUFPLEVBQUUsYUFBYTtLQUN2QixDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUE7QUFFRCx5RkFBeUY7QUFDekYsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQU8sWUFBMEIsRUFBRSxZQUEwQixFQUFtQixFQUFFO0lBQ3ZHLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLFlBQVksQ0FBQztJQUMvQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDO0lBQ2hDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxZQUFZLENBQUM7SUFFaEMsSUFBSSxRQUFRLEtBQUssU0FBUztRQUN4QixRQUFRLEdBQUcsS0FBSyxDQUFDO0lBRW5CLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLEtBQUssYUFBYTtRQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxPQUFPLGlEQUFpRCxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBRTVILE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCw4Q0FBOEM7SUFDOUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUU1RSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQzNDLEtBQUssRUFDTCxNQUFNLEVBQ04sT0FBTyxFQUNQLE9BQU8sQ0FDUixDQUFDO0lBRUYsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUIsQ0FBQyxDQUFBLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFTLEVBQVcsRUFBRTtJQUNoRCxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLO1FBQ2xCLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLO1FBQ1YsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQSJ9