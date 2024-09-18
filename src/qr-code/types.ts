interface BuildEmptyFrame {
    frame: number[];
    width: number;
}

export interface Encode {
    formatValue(maskId: number): number;
    formatBits(maskId: number): number[];

    buildEmptyFrame(version: number, maskId: number): BuildEmptyFrame;
    embedFormat(frame: number[], width: number, formatBits: number[]): void;
    makeScanner(width: number): Generator<[number, number], void, unknown>;
    embedCode(frame: number[], width: number, coded: Uint8Array, maskId: number): void;
    buildFrame(coded: Uint8Array, version: number, maskId: number): number[];

    width(version: number): number;
    blankFrame(width: number): number[];
    get(frame: number[], width: number, x: number, y: number): number;
    set(frame: number[], width: number, x: number, y: number, value: number): void;
    markFinder(frame: number[], width: number, cx: number, cy: number): void;
    markSeparator(frame: number[], width: number): void;
    markFinders(frame: number[], width: number): void;
    alignmentIndexes(version: number): number[];
    markAlignment(frame: number[], width: number, cx: number, cy: number): void;
    markAlignments(frame: number[], width: number, indexes: number[]): void;
    markTimings(frame: number[], width: number): void;
    makeFrame(version: number): number[];
}

export interface Evaluate {
    one(frame: number[], width: number): number;
    two(frame: number[], width: number): number;
    three(frame: number[], width: number): number;
    four(frame: number[]): number;
    total(frame: number[], width: number): number;
}

export interface PF2Poly {
    order(num: number): number;
    neg(num: number): number;
    add(a: number, b: number): number;
    sub(a: number, b: number): number;
    carry(num: number, k: number): number;
    mul(a: number, b: number): number;
    mod(a: number, b: number): number;
    times(num: number, k: number): number;
}

export interface Poly {
    deg(arr: number[], i: number): number;
    neg(arr: number[]): number[];
    scale(arr: number[], num: number): number[];
    add(a: number[], b: number[]): number[];
    sub(a: number[], b: number[]): number[];
    sum(arr: number[][]): number[];
    carry(arr: number[], k: number): number[];
    mul(a: number[], b: number[]): number[];
    order(arr: number[]): number;
    mod(a: number[], b: number[]): number[];
    prod(arr: number[][]): number[];
    coef(arr: number[], k: number): number;
    monomial(num: number, k: number): number[];
    diff(arr: number[]): number[];
    apply(arr: number[], v: number): number;
}

interface QRCodeType {
    version: number;
    totalLength: number;
    parityLength: number;
}

interface QRCodeResult {
    frame: number[];
    width: number;
    version: number;
}

export interface QRCode {
    getType(text: string): QRCodeType;
    generate(text: string): QRCodeResult;
    toSVG(frame: number[], width: number, scale: number): string;
}

export type MaskFormula = (x: number, y: number) => boolean;