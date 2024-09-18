import { GF2n } from './gf2n.ts';
import { pf2Poly } from './pf2-poly.ts';

import type { Poly } from './types.ts';

//Polynomial
export const poly: Poly = {
    //need
    deg(arr, i) {
        return i < 0 ? 0 : arr.length - 1 - i;
    },
    //need
    neg(arr) {
        return arr;
    },
    //need
    scale(arr, num) {
        //NOTE: create copy to prevent mutating array because in example this.mod,
        //it will be infinitely call itself once "b" gets mutated the first time
        const cArr = Array.from(arr);
        for (let i = 0; i < cArr.length; i++) {
            cArr[i] = GF2n.mul(cArr[i]!, num);
        }
        return cArr;
    },
    //need
    add(a, b) {
        if (a.length < b.length) {
            const temp = a;
            a = b;
            b = temp;
        }
        const diff = a.length - b.length;
        for (let i = 0; i < a.length; i++) {
            if (i >= diff) a[i] = pf2Poly.add(a[i]!, b[i - diff]!);
        }
        return a;
    },
    //need
    sub(a, b) {
        return this.add(a, this.neg(b));
    },
    //need
    sum(arr) {
        let total = [ 0 ];
        for (let i = 0; i < arr.length; i++) {
            total = this.add(total, arr[i]!);
        }
        return total;
    },
    //need
    carry(arr, k) {
        return arr.concat(Array(k).fill(0));
    },
    //need
    mul(a, b) {
        const arr: number[][] = Array(b.length);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = this.carry(this.scale(a, b[i]!), this.deg(b, i));
        }
        return this.sum(arr);
    },
    //need
    order(arr) {
        return this.deg(arr, arr.findIndex(v => v !== 0));
    },
    //need
    mod(a, b) {
        const ma = this.order(a);
        const mb = this.order(b);
        if (ma < mb) return a.slice(-mb);
        const f = GF2n.div(a[0]!, b[0]!);
        return this.mod(this.sub(a, this.carry(this.scale(b, f), ma - mb)).slice(1), b);
    },
    //need
    prod(arr) {
        let total = [ 1 ];
        for (let i = 0; i < arr.length; i++) {
            total = this.mul(total, arr[i]!);
        }
        return total;
    },
    coef(arr, k) {
        console.log('coef');
        return arr[this.deg(arr, k)] || 0;
    },
    //need
    monomial(num, k) {
        return this.carry([num], k);
    },
    diff(arr) {
        console.log('diff');
        const nArr: number[] = Array(arr.length - 1);
        for (let i = 0; i < nArr.length; i++) {
            nArr[i] = pf2Poly.times(arr[i]!, this.deg(arr, i));
        }
        return nArr;
    },
    apply(arr, v) {
        console.log('apply');
        for (let i = 0; i < arr.length; i++) {
            arr[i] = GF2n.mul(arr[i]!, GF2n.pow(v, this.deg(arr, i)));
        }
        return GF2n.sum(arr);
    }
}