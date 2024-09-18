import { ALGORITHM, BIT_MASK, DIGITS, SECRET_VALUES, TOTP_URL, WINDOW } from './const.ts';
import { util } from './util.ts';

import type { Encoding, SecretKey, TOTPOptions } from './types.ts';

//NOTE: secret key length for ascii encoding is 20,
//which means base32 encoding is 32 ((length / 5) * 8)

export class TOTP {
    private readonly options: TOTPOptions;
    readonly util = util;
    constructor(options: TOTPOptions) {
        this.options = options;
    }
    static castLength(length: string): number {
        const nLength = Number(length);
        if (!Number.isSafeInteger(nLength)) {
            throw new Error(`Length (${length}) is not an integer.`);
        }
        return nLength;
    }
    static currentTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }
    generateSecretKey(): SecretKey {
        let ascii = '';
        for (let i = 0; i < this.options.length; i++) {
            ascii += SECRET_VALUES[Math.floor(Math.random() * SECRET_VALUES.length)];
        }
        const base32 = this.util.toBase32(ascii);
        return {
            ascii,
            base32,
            //https://github.com/google/google-authenticator/wiki/Key-Uri-Format#parameters
            otpauth_url: TOTP_URL + this.options.name + '?secret=' + base32 + (ALGORITHM === 'SHA1' ? '' : ('&algorithm=' + ALGORITHM))
        }
    }
    async matches(code: string, secretKey: string, encoding: Encoding = 'ascii'): Promise<boolean> {
        const time = Math.floor(TOTP.currentTimestamp() / 30);
        let counter = time;
        counter -= WINDOW;
        for (; counter <= time + WINDOW; counter++) {
            const buffer = new Uint8Array(8);
            let temp = counter;
            for (let i = 0; i < buffer.length; i++) {
                buffer[7 - i] = temp & BIT_MASK.ALL_8;
                temp = temp >> 8;
            }
            const key = await crypto.subtle.importKey('raw', encoding === 'ascii' ? this.util.toBuffer(secretKey) : this.util.toAscii(secretKey), { name: 'HMAC', hash: ALGORITHM }, false, [ 'sign' ]);
            const serverSignature = await crypto.subtle.sign('HMAC', key, buffer);
            const codeBuffer = new Uint8Array(serverSignature);
            if (codeBuffer.length < 5) return false;
            //NOTE: non-null assertion for each element accessed,
            //because codeBuffer is at least 5 bytes
            let offset = codeBuffer[codeBuffer.length - 1]! & BIT_MASK.FIRST_4;
            const codeNumber = (codeBuffer[offset++]! & BIT_MASK.FIRST_7) << 24 |
                (codeBuffer[offset++]! & BIT_MASK.ALL_8) << 16 |
                (codeBuffer[offset++]! & BIT_MASK.ALL_8) << 8 |
                (codeBuffer[offset]! & BIT_MASK.ALL_8);
            console.log('codeNumber', codeNumber);
            if (code === ('0'.repeat(DIGITS) + codeNumber).slice(-DIGITS)) {
                return counter - time - WINDOW - WINDOW ? true : false;
            }
        }
        return false;
    }
}