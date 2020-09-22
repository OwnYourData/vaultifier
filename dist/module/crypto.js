var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sodium from 'libsodium-wrappers';
const hexStringToByte = (value) => {
    if (!value) {
        return new Uint8Array();
    }
    const a = [];
    for (let i = 0, len = value.length; i < len; i += 2) {
        a.push(parseInt(value.substr(i, 2), 16));
    }
    return new Uint8Array(a);
};
const createSha256Hex = (value) => __awaiter(void 0, void 0, void 0, function* () {
    // browser environment
    if (typeof globalThis.crypto !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const msgBuffer = new TextEncoder('utf-8').encode(value);
        const hashBuffer = yield crypto.subtle.digest('SHA-256', msgBuffer);
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
});
const sharedSecret = 'auth';
// the hash is created globally, so we don't use computing power to recreate it over and over
const sharedSecretHash = createSha256Hex(sharedSecret);
export const encrypt = (text, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES));
    const cipherMsg = sodium.crypto_box_easy(Buffer.from(text), nonce, Buffer.from(hexStringToByte(publicKey)), Buffer.from(hexStringToByte(yield sharedSecretHash)));
    return {
        value: Buffer.from(cipherMsg).toString('hex'),
        nonce: nonce.toString('hex'),
        version: '0.4',
    };
});
// SEE: https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
export const decrypt = (text, cipher, nonce) => __awaiter(void 0, void 0, void 0, function* () {
    const passwordHash = yield createSha256Hex(cipher);
    const privateKeyHash = yield sharedSecretHash;
    const decrypted = sodium.crypto_box_open_easy(text, Buffer.from(nonce), sodium.crypto_scalarmult_base(Buffer.from(privateKeyHash)), Buffer.from(passwordHash));
    return decrypted;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NyeXB0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLE1BQU0sTUFBTSxvQkFBb0IsQ0FBQztBQUV4QyxNQUFNLGVBQWUsR0FBRyxDQUFDLEtBQWEsRUFBRSxFQUFFO0lBQ3hDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDVixPQUFPLElBQUksVUFBVSxFQUFFLENBQUM7S0FDekI7SUFDRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbkQsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMxQztJQUNELE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFBO0FBRUQsTUFBTSxlQUFlLEdBQUcsQ0FBTyxLQUFhLEVBQW1CLEVBQUU7SUFDL0Qsc0JBQXNCO0lBQ3RCLElBQUksT0FBTyxVQUFVLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBRTtRQUM1Qyw2REFBNkQ7UUFDN0QsYUFBYTtRQUNiLE1BQU0sU0FBUyxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RCxNQUFNLFVBQVUsR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDekQsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUUvRSxPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUNELG1CQUFtQjtTQUNkO1FBQ0gsOERBQThEO1FBQzlELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVqQyxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO2FBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUM7YUFDYixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbEI7QUFDSCxDQUFDLENBQUEsQ0FBQTtBQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM1Qiw2RkFBNkY7QUFDN0YsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFdkQsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQU8sSUFBWSxFQUFFLFNBQWlCLEVBQUUsRUFBRTtJQUMvRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztJQUNoRixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqQixLQUFLLEVBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsRUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDLENBQ3JELENBQUM7SUFFRixPQUFPO1FBQ0wsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM3QyxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUE7QUFFRCx5RkFBeUY7QUFDekYsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQU8sSUFBWSxFQUFFLE1BQWMsRUFBRSxLQUFhLEVBQUUsRUFBRTtJQUMzRSxNQUFNLFlBQVksR0FBRyxNQUFNLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxNQUFNLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDO0lBRTlDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FDM0MsSUFBSSxFQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ2xCLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQzFELE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQzFCLENBQUM7SUFFRixPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDLENBQUEsQ0FBQSJ9