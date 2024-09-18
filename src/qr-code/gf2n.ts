import { pf2Poly } from './pf2-poly.ts';
import { REED_SOLOMON } from './const.ts';

//Galois Field 2^n
export class GF2n {
    //need
    private static readonly pn = 2 ** REED_SOLOMON.EXPONENT;
    //need
    private static readonly pn1 = this.pn - 1;
    //need
    private static readonly pows: number[] = Array(this.pn1);
    //need
    private static readonly expos: number[] = Array(this.pn);
    static {
        this.pows[0] = 1;
        for (let i = 1; i < this.pn1; i++) {
            this.pows[i] = this.mul0(this.pows[i - 1]!, 2);
        }
        this.expos[0] = NaN;
        for (let i = 1; i < this.pn; i++) {
            this.expos[i] = this.pows.indexOf(i);
        }
    }
    //need
    private static modpn1(k: number): number {
        return (this.pn1 + k % this.pn1) % this.pn1;
    }
    //need
    private static expo(num: number): number {
        return this.expos[num]!;
    }
    /*
    private static inv(num: number): number {
        console.log('inv');
        return num === 0 ? NaN : this.pows[this.modpn1(-this.expo(num))]!;
    }
    */
    //need
    private static mul0(a: number, b: number): number {
        return pf2Poly.mod(pf2Poly.mul(a, b), REED_SOLOMON.MODULUS);
    }
    //need
    static mul(a: number, b: number): number {
        return a === 0 || b === 0 ? 0 : this.pows[this.modpn1(this.expo(a) + this.expo(b))]!;
    }
    //need
    static pow(num: number, k: number): number {
        return num === 0 ? 0 : k === 1 ? num : this.pows[this.modpn1(this.expo(num) * k)]!;
    }
    //need
    static div(a: number, b: number): number {
        return b === 0 ? NaN : a === 0 ? 0 : this.pows[this.modpn1(this.expo(a) - this.expo(b))]!;
    }
    //need
    static alpha(k = 1): number {
        return this.pow(2, k);
    }
    static sum(arr: number[]): number {
        console.log('sum');
        let total = 0;
        for (let i = 0; i < arr.length; i++) {
            total = pf2Poly.add(total, arr[i]!);
        }
        return total;
    }
}