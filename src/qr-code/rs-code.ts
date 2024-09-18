import { GF2n } from './gf2n.ts';
import { poly } from './poly.ts';

export class RSCode {
    //need
    readonly parityLength: number;
    //need
    readonly gen: number[] = [];
    constructor(parityLength: number) {
        this.parityLength = parityLength;
        const arr: number[][] = Array(this.parityLength);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = poly.add(poly.monomial(1, 1), poly.monomial(GF2n.alpha(i), 0));
        }
        this.gen = poly.prod(arr);
    }
    //need
    parity(buffer: Uint8Array): number[] {
        const arr: number[] = Array(buffer.length);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = buffer[i]!;
        }
        return poly.mod(poly.carry(arr, this.parityLength), this.gen);
    }
}