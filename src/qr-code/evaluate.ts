import { encode } from './encode.ts';
import { EVALUATE3 } from './const.ts';

import type { Evaluate } from './types.ts';

export const evaluate: Evaluate = {
    //need
    one(frame, width) {
        let score = 0;
        for (let y = 0; y < width; y++) {
            let length = 1;
            let cy = encode.get(frame, width, 0, y);
            for (let x = 1; x < width; x++) {
                const cxy = encode.get(frame, width, x, y);
                if (cxy === cy) {
                    length++;
                    if (length === 5) score += 3;
                    else if (length > 5) score++;
                } else {
                    cy = cxy;
                    length = 1;
                }
            }
        }
        for (let x = 0; x < width; x++) {
            let length = 1;
            let cx = encode.get(frame, width, x, 0);
            for (let y = 1; y < width; y++) {
                const cxy = encode.get(frame, width, x, y);
                if (cxy === cx) {
                    length++;
                    if (length === 5) score += 3;
                    else if (length > 5) score++;
                } else {
                    cx = cxy;
                    length = 1;
                }
            }
        }
        return score;
    },
    //need
    two(frame, width) {
        let score = 0;
        for (let y = 1; y < width; y++) {
            for (let x = 1; x < width; x++) {
                const cxy = encode.get(frame, width, x, y);
                const cxyUp = encode.get(frame, width, x, y - 1);
                if (cxy !== cxyUp) {
                    x++;
                    continue;
                }
                if (encode.get(frame, width, x - 1, y - 1) === cxy &&
                    encode.get(frame, width, x - 1, y) === cxy) score += 3;
            }
        }
        return score;
    },
    //need
    three(frame, width) {
        let score = 0;
        for (let y = 0; y < width; y++) {
            let scan = 0;
            for (let x = 0; x < 10; x++) {
                scan = (scan << 1) | encode.get(frame, width, x, y);
            }
            for (let x = 10; x < width; x++) {
                scan = ((scan << 1) | encode.get(frame, width, x, y)) & EVALUATE3.BLACK;
                if (scan === EVALUATE3.PATTERN1 || scan === EVALUATE3.PATTERN2) score += 40;
            }
        }
        for (let x = 0; x < width; x++) {
            let scan = 0;
            for (let y = 0; y < 10; y++) {
                scan = (scan << 1) | encode.get(frame, width, x, y);
            }
            for (let y = 10; y < width; y++) {
                scan = ((scan << 1) | encode.get(frame, width, x, y)) & EVALUATE3.BLACK;
                if (scan === EVALUATE3.PATTERN1 || scan === EVALUATE3.PATTERN2) score += 40;
            }
        }
        return score;
    },
    //need
    four(frame) {
        let dark = 0;
        for (let i = 0; i < frame.length; i++) {
            if (frame[i] === 1) dark++;
        }
        return Math.floor(Math.abs(dark * 100 / frame.length - 50) / 5) * 10;
    },
    //need
    total(frame, width) {
        return this.one(frame, width) + this.two(frame, width) + this.three(frame, width) + this.four(frame);
    }
}