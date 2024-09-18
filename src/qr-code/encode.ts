import { FORMAT, MASK_PATTERNS } from './const.ts';
import { pf2Poly } from './pf2-poly.ts';
import { Reader } from './reader.ts';

import type { Encode } from './types.ts';

export const encode: Encode = {
    //need
    formatValue(maskId) {
        const data = pf2Poly.carry((FORMAT.EC_L << 3) | maskId, FORMAT.CARRY);
        return pf2Poly.sub(data, pf2Poly.mod(data, FORMAT.GENERATOR));
    },
    //need
    formatBits(maskId) {
        const coded = this.formatValue(maskId) ^ FORMAT.MASK;
        const arr: number[] = Array(FORMAT.BIT);
        for (let i = 0, j = arr.length - 1; i < arr.length; i++, j--) {
            arr[j] = (coded >>> i) & 1;
        }
        return arr;
    },

    //need
    buildEmptyFrame(version, maskId) {
        const width = this.width(version);
        const frame = this.makeFrame(version);
        const formatBits = this.formatBits(maskId);
        this.embedFormat(frame, width, formatBits);
        return { frame, width }
    },
    //need
    embedFormat(frame, width, formatBits) {
        //top left, go left then go up
        for (let i = 0; i < 6; i++) {
            this.set(frame, width, i, 8, formatBits[i]!);
        }
        this.set(frame, width, 7, 8, formatBits[6]!);
        this.set(frame, width, 8, 8, formatBits[7]!);
        this.set(frame, width, 8, 7, formatBits[8]!);
        for (let i = 9; i < 15; i++) {
            this.set(frame, width, 8, 14 - i, formatBits[i]!);
        }
        //bottom-left, go left
        for (let i = 0; i < 7; i++) {
            this.set(frame, width, 8, width - 1 - i, formatBits[i]!);
        }
        //top-right, go up
        for (let i = 7; i < 15; i++) {
            this.set(frame, width, width - 15 + i, 8, formatBits[i]!);
        }
    },
    //need
    *makeScanner(width) {
        let x = width - 1, y = width - 1, dy = -1;
        while (x >= 0) {
            yield [x, y];
            x--;
            yield [x, y];
            y += dy;
            if (+(0 <= y) & +(y < width)) {
                x++;
            } else {
                y -= dy;
                dy *= -1;
                x--;
                if (x === 6) x--;
            }
        }
    },
    //need
    embedCode(frame, width, coded, maskId) {
        const reader = new Reader(coded);
        const itr = this.makeScanner(width);
        let next = itr.next();
        while (!next.done) {
            const [x, y] = next.value;
            next = itr.next();
            if (this.get(frame, width, x, y) !== null) continue;
            const bit = reader.isEnd() ? 0 : reader.readBit();
            const mask = +MASK_PATTERNS[maskId]!(x, y);
            this.set(frame, width, x, y, mask ^ bit);
        }
    },
    //need
    buildFrame(coded, version, maskId) {
        const build = this.buildEmptyFrame(version, maskId);
        this.embedCode(build.frame, build.width, coded, maskId);
        return build.frame;
    },

    //need
    width(version) {
        return 17 + version * 4;
    },
    //need
    blankFrame(width) {
        return Array(width ** 2).fill(null);
    },
    //need
    get(frame, width, x, y) {
        return frame[y * width + x]!;
    },
    //need
    set(frame, width, x, y, value) {
        frame[y * width + x] = value;
    },
    //need
    markFinder(frame, width, cx, cy) {
        for (let x = 0; x < 7; x++) {
            for (let y = 0; y < 7; y++) {
                const value = x === 0 || x === 6 || y === 0 || y === 6 ||
                    (x >= 2 && x <= 4 && y >= 2 && y <= 4);
                this.set(frame, width, cx - 3 + x, cy - 3 + y, +value);
            }
        }
    },
    //need
    markSeparator(frame, width) {
        for (let i = 0; i < 8; i++) {
            //top left
            this.set(frame, width, 7, i, 0); //v
            this.set(frame, width, i, 7, 0); //h
            //top right
            this.set(frame, width, width - 8, i, 0); //v
            this.set(frame, width, width - 1 - i, 7, 0); //h
            //bottom left
            this.set(frame, width, 7, width - 1 - i, 0); //v
            this.set(frame, width, i, width - 8, 0); //h
        }
    },
    //need
    markFinders(frame, width) {
        this.markFinder(frame, width, 3, 3);
        this.markFinder(frame, width, width - 4, 3);
        this.markFinder(frame, width, 3, width - 4);
        this.markSeparator(frame, width);
    },
    //need
    alignmentIndexes(version) {
        if (version < 2) return [];
        const last = this.width(version) - 7;
        if (version < 7) return [ last ];
        throw new Error('Alignment indexes only supports version 1 through 6.');
    },
    //need
    markAlignment(frame, width, cx, cy) {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                const value = x === 0 || x === 4 || y === 0 || y === 4 ||
                    (x === 2 && y === 2);
                this.set(frame, width, cx - 2 + x, cy - 2 + y, +value);
            }
        }
    },
    //need
    markAlignments(frame, width, indexes) {
        for (let x = 0; x < indexes.length; x++) {
            for (let y = 0; y < indexes.length; y++) {
                this.markAlignment(frame, width, indexes[x]!, indexes[y]!);
            }
        }
        for (let x = 0; x < indexes.length - 1; x++) {
            this.markAlignment(frame, width, indexes[x]!, 6);
        }
        for (let y = 0; y < indexes.length - 1; y++) {
            this.markAlignment(frame, width, 6, indexes[y]!);
        }
    },
    //need
    markTimings(frame, width) {
        for (let i = 8; i < width - 8; i++) {
            this.set(frame, width, 6, i, 1 - (i & 1)); //v-line
            this.set(frame, width, i, 6, 1 - (i & 1)); //h-line
        }
    },
    //need
    makeFrame(version) {
        const width = this.width(version);
        const frame = this.blankFrame(width);
        this.markFinders(frame, width);
        const indexes = this.alignmentIndexes(version);
        this.markAlignments(frame, width, indexes);
        this.markTimings(frame, width);
        this.set(frame, width, 8, width - 8, 1);
        return frame;
    }
}