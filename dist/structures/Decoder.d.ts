/// <reference types="node" />
import type { FrameData } from '../types';
export declare class Decoder {
    private url;
    private cumulative;
    private frameCount;
    private started;
    constructor(url: string | Buffer);
    private handleGIF;
    private getPixels;
    private handleData;
    private savePixels;
    start(): Promise<FrameData[]>;
    setFramesCount(count: "all" | number): this;
    setCollective(value: boolean): this;
}
