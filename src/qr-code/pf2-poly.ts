import type { PF2Poly } from './types.ts';

//Prime Field 2 Polynomial
export const pf2Poly: PF2Poly = {
    //need
    order(num) {
        return Math.max(0, 31 - Math.clz32(num));
    },
    neg(num) {
        console.log('neg');
        return num;
    },
    //need
    add(a, b) {
        return a ^ b;
    },
    //need
    sub(a, b) {
        return a ^ b;
    },
    //need
    carry(num, k) {
        return num << k;
    },
    //need
    mul(a, b) {
        let result = 0;
        for (; b > 0; b >>>= 1, a <<= 1) {
            if (b & 1) result ^= a;
        }
        return result;
    },
    //need
    mod(a, b) {
        const ma = this.order(a);
        const mb = this.order(b);
        for (let i = ma - mb, m = 1 << ma; i >= 0; i--, m >>>= 1) {
            if (a & m) a ^= b << i;
        }
        return a;
    },
    times(num, k) {
        console.log('times');
        return k % 2 === 0 ? 0 : num;
    }
}