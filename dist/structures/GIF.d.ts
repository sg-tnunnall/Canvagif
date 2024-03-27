/// <reference types="node" />
import ByteArray from "../Encoder/ByteArray";
import { type CanvasRenderingContext2D } from "canvas";
import { FrameData } from "../types";
export declare class GIF {
    /**
      * Context width
      * @type {number}
      * @public
    */
    width: number;
    /**
      * Context height
      * @type {number}
      * @public
    */
    height: number;
    private delay;
    private repeat;
    private dispose;
    private transIndex;
    private transparent;
    private sample;
    private colorDepth;
    private palSize;
    private firstFrame;
    private usedEntry;
    private colorTab;
    private pixels;
    private indexedPixels;
    private image;
    readonly out: ByteArray;
    /**
       * Encoder constructor
       * @param {number} width Canvas Width
       * @param {number} height Canvas Height
    */
    constructor(width?: number, height?: number);
    /**
       * Decode gif from url
       * @param {string | Buffer} image Buffer or URL on gif
       * @param {number | "all"} frames Number of frames to decode or "all"
       * @returns {Promise<FrameData[]>} Frame array
    */
    decode(image: string | Buffer, frames?: number | "all"): Promise<FrameData[]>;
    /**
     * Write out a new frame to the GIF.
     * @returns {void} void
    */
    addFrame(context: CanvasRenderingContext2D): void;
    private getImagePixels;
    private analyzePixels;
    private findClosest;
    private writeLSD;
    private writeShort;
    private writePixels;
    private writePalette;
    private writeGraphicCtrlExt;
    private writeImageDesc;
    private writeNetscapeExt;
    /**
     * Ends encode and the final byte of the gif is being written
     * @returns {Buffer} a boolean value that indicates the success of the gif creation
    */
    buffer(): Buffer;
    /**
     * Set milliseconds to wait between frames
     * Default 100 / 30
     * @param {number} milliseconds number milliseconds of encoder's delay
     * @returns {Encoder} Encoder
    */
    setDelay(milliseconds: number): this;
    /**
     * Set encoder fps
     *
     * Default 30
     * @param {number} fps number frames of encoder per second
     * @returns {Encoder} Encoder
    */
    setFrameRate(fps: number): this;
    /**
     * Set the disposal code
     * @param {number} code alters behavior of how to render between frames. If no transparent color has been set, defaults to 0. Otherwise, defaults to 2.
     *
     * Values :
     *
     *    0 — No disposal specified. The decoder is not required to take any action.
     *
     *    1 — Do not dispose. The graphic is to be left in place.
     *
     *    2 — Restore to background color. The area used by the graphic must be restored to the background color.
     *
     *    3 — Restore to previous. The decoder is required to restore the area overwritten by the graphic with what was there prior to rendering the graphic.
     *
     * @returns {Encoder} Encoder
    */
    setDispose(code: number): this;
    /**
     * Sets amount of times to repeat GIF
     * @param {number} value amount of repeat
     *
     *
     * Values :
     *
     *    -1 — Play once.
     *
     *    0 — Loop indefinitely.
     *
     *    n — a positive number, loop n times, cannot be more than 20.
     *
     * @returns {Encoder} Encoder
    */
    setRepeat(value: number): this;
    /**
     * Set the quality.
     * @param {number} quality positive number
     *
     *
     * Info :
     *
     *    1 — best colors, worst performance.
     *
     *    n — the higher the number, the worse the quality.
     *
     * @returns {Encoder} Encoder
    */
    setQuality(quality: number): this;
    /**
     * Define the color which represents transparency in the GIF.
     * @param {number} color color to represent transparent background
     *
     * Example: 0x00FF00
     * @returns {Encoder} Encoder
    */
    setTransparent(color: number): this;
}
