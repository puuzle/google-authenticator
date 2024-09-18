export class Reader {
    //need
    readonly buffer: Uint8Array;
    //need
    offset = 0;
    //need
    position = 7;
    constructor(buffer: Uint8Array) {
        this.buffer = buffer;
    }
    //need
    isEnd(): boolean {
        return this.offset >= this.buffer.length;
    }
    //need
    readBit(): number {
        if (this.isEnd()) throw new Error('No more bits to read.');
        //NOTE: non-null assertion because this.isEnd() checks the index access
        const byte = this.buffer[this.offset]!;
        //get unsigned byte for current position,
        //and parse the last bit if it's 1 or 0
        const bit = (byte >>> this.position) & 1;
        //go to next position
        this.position--;
        //end of byte, so reset position and increment offset
        if (this.position < 0) {
            this.position = 7;
            this.offset++;
        }
        return bit;
    }
}