export class Writer {
    //need
    readonly buffer: Uint8Array;
    //need
    offset = 0;
    //need
    byte = 0;
    //need
    position = 7;
    constructor(length: number) {
        this.buffer = new Uint8Array(length);
    }
    //need
    private writeBit(bit: number): void {
        //insert bit into byte at this.position + 1
        this.byte |= bit << this.position;
        //go to next position
        this.position--;
        //end of byte, so insert byte into buffer, and reset byte and position
        if (this.position < 0) {
            this.buffer[this.offset++] = this.byte;
            this.byte = 0;
            this.position = 7;
        }
    }
    //need
    writeByte(value: number, bitSize: number): void {
        //reverse loop because this.writeBit is left shifting each bit
        for (let i = bitSize - 1; i >= 0; i--) {
            //get unsigned byte for specified position (i),
            //and parse the last bit if it's 1 or 0
            this.writeBit((value >>> i) & 1);
        }
    }
}