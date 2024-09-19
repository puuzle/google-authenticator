import { BASE32, BIT_MASK, ISO_IEC_8859_1 } from './const.ts';

import type { Util } from './types.ts';

export const util: Util = {
    toAscii(base32) {
        const buffer = new Uint8Array(base32.length);
        let offset = 0;
        let shift = 8;
        let carry = 0;
        for (let i = 0; i < base32.length; i++) {
            //NOTE: non-null assertion because never reassigning "i"
            const byte = base32[i]!;
            if (byte === '=') continue;
            //NOTE: reflect get to allow any character to be used in the key
            const value = typeof byte === 'string' ? Reflect.get(BASE32.CHAR_MAP, byte) : byte;
            if (value === undefined) throw new Error(`Byte (${byte}) is not a key in BASE32.CHAR_MAP object.`);
            const symbol = value & BIT_MASK.ALL_8;
            shift -= 5;
            if (shift > 0) {
                carry |= symbol << shift;
            } else if (shift < 0) {
                buffer[offset++] = carry | (symbol >> -shift);
                shift += 8;
                carry = (symbol << shift) & BIT_MASK.ALL_8;
            } else {
                buffer[offset++] = carry | symbol;
                shift = 8;
                carry = 0;
            }
        }
        if (shift !== 8 && carry !== 0) buffer[offset++] = carry;
        return buffer.slice(0, offset);
    },
    toBase32(ascii) {
        const buffer = this.toBuffer(ascii);
        let shift = 3;
        let carry = 0;
        let symbol: number;
        let base32 = '';
        for (let i = 0; i < buffer.length; i++) {
            //NOTE: non-null assertion because never reassigning "i"
            const byte = buffer[i]!;
            symbol = carry | (byte >> shift);
            base32 += BASE32.VALUES[symbol & BIT_MASK.FIRST_5];
            if (shift > 5) {
                shift -= 5;
                symbol = byte >> shift;
                base32 += BASE32.VALUES[symbol & BIT_MASK.FIRST_5];
            }
            shift = 5 - shift;
            carry = byte << shift;
            shift = 8 - shift;
        }
        if (shift !== 3) base32 += BASE32.VALUES[carry & BIT_MASK.FIRST_5];
        return base32;
    },
    toBuffer(ascii) {
        const buffer = new Uint8Array(ascii.length);
        for (let i = 0; i < buffer.length; i++) {
            //NOTE: reflect get to allow any character to be used in the key,
            //and non-null assertion because never reassigning "i"
            const value = Reflect.get(ISO_IEC_8859_1, ascii[i]!);
            if (!value) throw new Error(`Character (${ascii[i]}) in ascii is not iso/iec 8859-1.`);
            buffer[i] = value;
        }
        return buffer;
    }
}