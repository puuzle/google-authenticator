import type { MaskFormula } from './types.ts';

//https://www.thonky.com/qr-code-tutorial/error-correction-table
export const EC_L_CW = [
    // [ TOTAL_LENGTH, PARITY_LENGTH ]
    [ 19, 7 ], //1
    [ 34, 10 ], //2
    [ 55, 15 ], //3
    [ 80, 20 ], //4
    [ 108, 26 ], //5
] as const,

//https://www.thonky.com/qr-code-tutorial/data-masking#evaluation-condition-3
EVALUATE3 = {
    PATTERN1: 0b10111010000,
    PATTERN2: 0b00001011101,
    BLACK: 0b11111111111
} as const,

FORMAT = {
    //https://www.thonky.com/qr-code-tutorial/format-version-information#the-error-correction-bits
    EC_L: 0b01,
    //https://www.thonky.com/qr-code-tutorial/format-version-information#generate-error-correction-bits-for-format-string
    CARRY: 10,
    //https://www.thonky.com/qr-code-tutorial/format-version-information#generate-error-correction-bits-for-format-string
    GENERATOR: 0b10100110111,
    //https://www.thonky.com/qr-code-tutorial/format-version-information#generate-the-format-string
    MASK: 0b101010000010010,
    //https://www.thonky.com/qr-code-tutorial/format-version-information#generate-the-format-string
    BIT: 15
} as const,

//https://www.thonky.com/qr-code-tutorial/mask-patterns
MASK_PATTERNS: MaskFormula[] = [
    (x, y) => (x + y) % 2 === 0,
    (_, y) => y % 2 === 0,
    (x, _) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => ((x - x % 3) / 3 + (y - y % 2) / 2) % 2 === 0,
    (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
    (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0,
    (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0
] as const,

//https://www.thonky.com/qr-code-tutorial/data-encoding#step-3-add-the-mode-indicator
MODE_INDICATOR = {
    BYTE: 0b0100
} as const,

//https://www.thonky.com/qr-code-tutorial/error-correction-coding#step-3-understand-the-galois-field
REED_SOLOMON = {
    EXPONENT: 8,
    MODULUS: 0b100011101
} as const,

//https://www.thonky.com/qr-code-tutorial/data-encoding#add-a-terminator-of-0s-if-necessary
//https://www.thonky.com/qr-code-tutorial/data-encoding#add-pad-bytes-if-the-string-is-still-too-short
TERMINATOR = {
    ZERO: 0b0000,
    PAD1: 0b11101100,
    PAD2: 0b00010001
} as const;