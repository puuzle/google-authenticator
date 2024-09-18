export type Encoding = 'ascii' | 'base32';

export interface SecretKey {
    ascii: string;
    base32: string;
    otpauth_url: string;
}

export interface TOTPOptions {
    name: string;
    length: number;
}

export interface Util {
    toAscii(base32: string): Uint8Array;
    toBase32(ascii: string): string;
    toBuffer(ascii: string): Uint8Array;
}