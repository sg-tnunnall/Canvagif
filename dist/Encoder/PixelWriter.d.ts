import { PixelWriterDetails } from "../types";
import ByteArray from "./ByteArray";
export default class PixelWriter {
    static maxCode(nBits: number): number;
    private pixels;
    readonly width: number;
    readonly height: number;
    private remaining;
    readonly initCodeSize: number;
    private accum;
    private hTab;
    private codetab;
    private curAccum;
    private curBits;
    private curPixel;
    private freeEnt;
    private aCount;
    private maxCode;
    private nBits;
    private clearFlag;
    private globalInitBits;
    private clearCode;
    private EOFCode;
    readonly bitMasks: number[];
    constructor(width: number, height: number, details: PixelWriterDetails);
    private charOut;
    private clBlock;
    private clHash;
    private compress;
    encode(outs: ByteArray): void;
    private flush;
    private nextPixel;
    private output;
}