import { EC_L_CW, MASK_PATTERNS, MODE_INDICATOR, TERMINATOR } from './const.ts';
import { encode } from './encode.ts';
import { evaluate } from './evaluate.ts';
import { ISO_IEC_8859_1 } from '../const.ts';
import { RSCode } from './rs-code.ts';
import { Writer } from './writer.ts';

import type { QRCode } from './types.ts';

export const qrCode: QRCode = {
    getType(text) {
        for (let i = 0; i < EC_L_CW.length; i++) {
            const [ totalLength, parityLength ] = EC_L_CW[i]!;
            if (totalLength - 2 < text.length) continue;
            return {
                version: i + 1,
                totalLength,
                parityLength
            }
        }
        throw new Error('QR code type only supports version 1 through 5.');
    },
    generate(text) {
        const type = this.getType(text);
        const writer = new Writer(type.totalLength);
        const buffer = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            const value = Reflect.get(ISO_IEC_8859_1, text[i]!);
            if (!value) throw new Error(`Character (${text[i]}) in text is not iso/iec 8859-1.`);
            buffer[i] = value;
        }
        writer.writeByte(MODE_INDICATOR.BYTE, 4);
        writer.writeByte(buffer.length, 8);
        for (let i = 0; i < buffer.length; i++) {
            writer.writeByte(buffer[i]!, 8);
        }
        writer.writeByte(TERMINATOR.ZERO, 4);
        for (let i = 0; writer.offset < type.totalLength; i++) {
            writer.buffer[writer.offset++] = i % 2 ? TERMINATOR.PAD2 : TERMINATOR.PAD1;
        }
        const rsCode = new RSCode(type.parityLength);
        const parities = rsCode.parity(writer.buffer);
        const width = encode.width(type.version);
        const coded = new Uint8Array(writer.buffer.length + parities.length);
        coded.set(writer.buffer);
        coded.set(parities, writer.buffer.length);
        let lowest: { frame: number[]; penalty: number } | undefined;
        for (let i = 0; i < MASK_PATTERNS.length; i++) {
            const frame = encode.buildFrame(coded, type.version, i);
            const penalty = evaluate.total(frame, width);
            if (!lowest) lowest = { frame, penalty };
            if (penalty < lowest.penalty) lowest = { frame, penalty };
        }
        return {
            frame: lowest!.frame,
            width,
            version: type.version
        }
    },
    toSVG(frame, width, scale) {
        let darks = '';
        for (let i = 0; i < frame.length; i++) {
            const bit = frame[i]!;
            if (bit === 0) continue;
            if (bit !== 1) throw new Error(`Frame contains non-bit (${bit}) at index ${i}.`);
            const x = i % width;
            const y = (i - x) / width;
            darks += `<rect x="${x + 2}" y="${y + 2}" width="1" height="1"/>`;
        }
        const w = width + 4;
        const size = w * scale;
        return '<svg xmlns="https://www.w3.org/2000/svg" version"1" '
            + `viewBox="0 0 ${w} ${w}" width="${size}px" height="${size}px">`
            + `<rect x="0" y="0" width="${w}" height="${w}" fill="white"/>${darks}</svg>`;
    }
}