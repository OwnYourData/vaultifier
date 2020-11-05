"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEncrypted = exports.decrypt = exports.encrypt = void 0;
const libsodium_wrappers_1 = __importStar(require("libsodium-wrappers"));
const core_utils_1 = require("./utils/core-utils");
const createSha256Hex = (value) => __awaiter(void 0, void 0, void 0, function* () {
    // browser environment
    if (typeof globalThis.crypto !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const msgBuffer = new TextEncoder('utf-8').encode(value);
        const hashBuffer = yield crypto.subtle.digest('SHA-256', msgBuffer);
        return libsodium_wrappers_1.to_hex(new Uint8Array(hashBuffer));
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
exports.encrypt = (text, publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    const nonce = libsodium_wrappers_1.default.randombytes_buf(libsodium_wrappers_1.default.crypto_box_NONCEBYTES);
    const cipherMsg = libsodium_wrappers_1.default.crypto_box_easy(libsodium_wrappers_1.from_string(text), nonce, libsodium_wrappers_1.from_hex(publicKey), libsodium_wrappers_1.from_hex(yield sharedSecretHash));
    return {
        value: libsodium_wrappers_1.to_hex(cipherMsg),
        nonce: libsodium_wrappers_1.to_hex(nonce),
        version: cryptoVersion,
    };
});
// SEE: https://libsodium.gitbook.io/doc/public-key_cryptography/authenticated_encryption
exports.decrypt = (cryptoObject, cipherObject) => __awaiter(void 0, void 0, void 0, function* () {
    const { value, nonce, version } = cryptoObject;
    const { cipher } = cipherObject;
    let { isHashed } = cipherObject;
    if (isHashed === undefined)
        isHashed = false;
    if (!!version && version !== cryptoVersion)
        throw new Error(`The provided crypto version (${version}) does not match our internal crypto version (${cryptoVersion})`);
    const _text = libsodium_wrappers_1.from_hex(value);
    const _nonce = libsodium_wrappers_1.from_hex(nonce);
    const _privKey = libsodium_wrappers_1.from_hex(yield sharedSecretHash);
    // calculates the our private key's public key
    const _pubKey = libsodium_wrappers_1.default.crypto_scalarmult_base(_privKey);
    const _cipher = libsodium_wrappers_1.from_hex(isHashed ? cipher : yield createSha256Hex(cipher));
    const decrypted = libsodium_wrappers_1.default.crypto_box_open_easy(_text, _nonce, _pubKey, _cipher);
    return libsodium_wrappers_1.to_string(decrypted);
});
exports.isEncrypted = (item) => {
    return !!(item.value &&
        core_utils_1.onlyContainsHex(item.value) &&
        item.nonce &&
        core_utils_1.onlyContainsHex(item.nonce) &&
        item.version);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NyeXB0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUVBQXNGO0FBRXRGLG1EQUFxRDtBQWFyRCxNQUFNLGVBQWUsR0FBRyxDQUFPLEtBQWEsRUFBbUIsRUFBRTtJQUMvRCxzQkFBc0I7SUFDdEIsSUFBSSxPQUFPLFVBQVUsQ0FBQyxNQUFNLEtBQUssV0FBVyxFQUFFO1FBQzVDLDZEQUE2RDtRQUM3RCxhQUFhO1FBQ2IsTUFBTSxTQUFTLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRXBFLE9BQU8sMkJBQU0sQ0FBQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0lBQ0QsbUJBQW1CO1NBQ2Q7UUFDSCw4REFBOEQ7UUFDOUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWpDLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7YUFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQzthQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNsQjtBQUNILENBQUMsQ0FBQSxDQUFBO0FBRUQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzVCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUM1Qiw2RkFBNkY7QUFDN0YsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFMUMsUUFBQSxPQUFPLEdBQUcsQ0FBTyxJQUFZLEVBQUUsU0FBaUIsRUFBeUIsRUFBRTtJQUN0RixNQUFNLEtBQUssR0FBRyw0QkFBTSxDQUFDLGVBQWUsQ0FBQyw0QkFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDbkUsTUFBTSxTQUFTLEdBQUcsNEJBQU0sQ0FBQyxlQUFlLENBQ3RDLGdDQUFXLENBQUMsSUFBSSxDQUFDLEVBQ2pCLEtBQUssRUFDTCw2QkFBUSxDQUFDLFNBQVMsQ0FBQyxFQUNuQiw2QkFBUSxDQUFDLE1BQU0sZ0JBQWdCLENBQUMsQ0FDakMsQ0FBQztJQUVGLE9BQU87UUFDTCxLQUFLLEVBQUUsMkJBQU0sQ0FBQyxTQUFTLENBQUM7UUFDeEIsS0FBSyxFQUFFLDJCQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3BCLE9BQU8sRUFBRSxhQUFhO0tBQ3ZCLENBQUM7QUFDSixDQUFDLENBQUEsQ0FBQTtBQUVELHlGQUF5RjtBQUM1RSxRQUFBLE9BQU8sR0FBRyxDQUFPLFlBQTBCLEVBQUUsWUFBMEIsRUFBbUIsRUFBRTtJQUN2RyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxZQUFZLENBQUM7SUFDL0MsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLFlBQVksQ0FBQztJQUNoQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsWUFBWSxDQUFDO0lBRWhDLElBQUksUUFBUSxLQUFLLFNBQVM7UUFDeEIsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUVuQixJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxLQUFLLGFBQWE7UUFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsT0FBTyxpREFBaUQsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUU1SCxNQUFNLEtBQUssR0FBRyw2QkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLE1BQU0sTUFBTSxHQUFHLDZCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsTUFBTSxRQUFRLEdBQUcsNkJBQVEsQ0FBQyxNQUFNLGdCQUFnQixDQUFDLENBQUM7SUFDbEQsOENBQThDO0lBQzlDLE1BQU0sT0FBTyxHQUFHLDRCQUFNLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEQsTUFBTSxPQUFPLEdBQUcsNkJBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUU1RSxNQUFNLFNBQVMsR0FBRyw0QkFBTSxDQUFDLG9CQUFvQixDQUMzQyxLQUFLLEVBQ0wsTUFBTSxFQUNOLE9BQU8sRUFDUCxPQUFPLENBQ1IsQ0FBQztJQUVGLE9BQU8sOEJBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QixDQUFDLENBQUEsQ0FBQTtBQUVZLFFBQUEsV0FBVyxHQUFHLENBQUMsSUFBUyxFQUFXLEVBQUU7SUFDaEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSztRQUNsQiw0QkFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDM0IsSUFBSSxDQUFDLEtBQUs7UUFDViw0QkFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQSJ9