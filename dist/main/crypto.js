"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const libsodium_wrappers_1 = __importDefault(require("libsodium-wrappers"));
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
exports.encrypt = (text, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const nonce = Buffer.from(libsodium_wrappers_1.default.randombytes_buf(libsodium_wrappers_1.default.crypto_box_NONCEBYTES));
    const cipherMsg = libsodium_wrappers_1.default.crypto_box_easy(Buffer.from(text), nonce, Buffer.from(hexStringToByte(publicKey)), Buffer.from(hexStringToByte(yield sharedSecretHash)));
    return {
        value: Buffer.from(cipherMsg).toString('hex'),
        nonce: nonce.toString('hex'),
        version: '0.4',
    };
});
// SEE: https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
exports.decrypt = (text, cipher, nonce) => __awaiter(void 0, void 0, void 0, function* () {
    const passwordHash = yield createSha256Hex(cipher);
    const privateKeyHash = yield sharedSecretHash;
    const decrypted = libsodium_wrappers_1.default.crypto_box_open_easy(text, Buffer.from(nonce), libsodium_wrappers_1.default.crypto_scalarmult_base(Buffer.from(privateKeyHash)), Buffer.from(passwordHash));
    return decrypted;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NyeXB0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0RUFBd0M7QUFFeEMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFhLEVBQUUsRUFBRTtJQUN4QyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsT0FBTyxJQUFJLFVBQVUsRUFBRSxDQUFDO0tBQ3pCO0lBQ0QsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ25ELENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDMUM7SUFDRCxPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQTtBQUVELE1BQU0sZUFBZSxHQUFHLENBQU8sS0FBYSxFQUFtQixFQUFFO0lBQy9ELHNCQUFzQjtJQUN0QixJQUFJLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7UUFDNUMsNkRBQTZEO1FBQzdELGFBQWE7UUFDYixNQUFNLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekQsTUFBTSxVQUFVLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEUsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFL0UsT0FBTyxPQUFPLENBQUM7S0FDaEI7SUFDRCxtQkFBbUI7U0FDZDtRQUNILDhEQUE4RDtRQUM5RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFakMsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQzthQUMvQixNQUFNLENBQUMsS0FBSyxDQUFDO2FBQ2IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2xCO0FBQ0gsQ0FBQyxDQUFBLENBQUE7QUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDNUIsNkZBQTZGO0FBQzdGLE1BQU0sZ0JBQWdCLEdBQUcsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRTFDLFFBQUEsT0FBTyxHQUFHLENBQU8sSUFBWSxFQUFFLFNBQWlCLEVBQUUsRUFBRTtJQUMvRCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLDRCQUFNLENBQUMsZUFBZSxDQUFDLDRCQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sU0FBUyxHQUFHLDRCQUFNLENBQUMsZUFBZSxDQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqQixLQUFLLEVBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsRUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDLENBQ3JELENBQUM7SUFFRixPQUFPO1FBQ0wsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM3QyxLQUFLLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO0FBQ0osQ0FBQyxDQUFBLENBQUE7QUFFRCx5RkFBeUY7QUFDNUUsUUFBQSxPQUFPLEdBQUcsQ0FBTyxJQUFZLEVBQUUsTUFBYyxFQUFFLEtBQWEsRUFBRSxFQUFFO0lBQzNFLE1BQU0sWUFBWSxHQUFHLE1BQU0sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELE1BQU0sY0FBYyxHQUFHLE1BQU0sZ0JBQWdCLENBQUM7SUFFOUMsTUFBTSxTQUFTLEdBQUcsNEJBQU0sQ0FBQyxvQkFBb0IsQ0FDM0MsSUFBSSxFQUNKLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ2xCLDRCQUFNLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUMxRCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUMxQixDQUFDO0lBRUYsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQyxDQUFBLENBQUEifQ==