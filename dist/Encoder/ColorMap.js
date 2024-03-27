"use strict";
/* NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994.
 * See "Kohonen neural networks for optimal colour quantization"
 * in "Network: Computation in Neural Systems" Vol. 5 (1994) pp 351-367.
 * for a discussion of the algorithm.
 * See also  http://members.ozemail.com.au/~dekker/NEUQUANT.HTML
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal
 * in this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons who receive
 * copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 *
 * (JavaScript port 2012 by Johan Nordberg)
*/
Object.defineProperty(exports, "__esModule", { value: true });
class ColorMap {
    pixels;
    samplefac;
    network = [];
    netindex = new Int32Array(256);
    bias = new Int32Array(256);
    freq = new Int32Array(256);
    radpower = new Int32Array(256 >> 3);
    constructor(pixels, samplefac) {
        this.pixels = pixels;
        this.samplefac = samplefac;
    }
    init() {
        let i, v;
        for (i = 0; i < 256; i++) {
            v = (i << (4 + 8)) / 256;
            this.network[i] = new Float64Array([v, v, v, 0]);
            this.freq[i] = (1 << 16) / 256;
            this.bias[i] = 0;
        }
    }
    unbiasnet() {
        for (let i = 0; i < 256; i++) {
            this.network[i][0] >>= 4;
            this.network[i][1] >>= 4;
            this.network[i][2] >>= 4;
            this.network[i][3] = i;
        }
    }
    altersingle(alpha, i, b, g, r) {
        this.network[i][0] -= (alpha * (this.network[i][0] - b)) / (1 << 10);
        this.network[i][1] -= (alpha * (this.network[i][1] - g)) / (1 << 10);
        this.network[i][2] -= (alpha * (this.network[i][2] - r)) / (1 << 10);
    }
    alterneigh(radius, i, b, g, r) {
        const lo = Math.abs(i - radius);
        const hi = Math.min(i + radius, 256);
        let k = i - 1, m = 1, j = i + 1;
        let p, a;
        while ((j < hi) || (k > lo)) {
            a = this.radpower[m++];
            if (j < hi) {
                p = this.network[j++];
                p[0] -= (a * (p[0] - b)) / (1 << 18);
                p[1] -= (a * (p[1] - g)) / (1 << 18);
                p[2] -= (a * (p[2] - r)) / (1 << 18);
            }
            if (k > lo) {
                p = this.network[k--];
                p[0] -= (a * (p[0] - b)) / (1 << 18);
                p[1] -= (a * (p[1] - g)) / (1 << 18);
                p[2] -= (a * (p[2] - r)) / (1 << 18);
            }
        }
    }
    contest(b, g, r) {
        let bestd = ~(1 << 31), bestbiasd = bestd, bestpos = -1, bestbiaspos = -1;
        let i, n, dist, biasdist, betafreq;
        for (i = 0; i < 256; i++) {
            n = this.network[i];
            dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
            if (dist < bestd) {
                bestd = dist;
                bestpos = i;
            }
            biasdist = dist - ((this.bias[i]) >> (16 - 4));
            if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = i;
            }
            betafreq = (this.freq[i] >> 10);
            this.freq[i] -= betafreq;
            this.bias[i] += (betafreq << 10);
        }
        this.freq[bestpos] += ((1 << 16) >> 10);
        this.bias[bestpos] -= ((1 << 16) << 0);
        return bestbiaspos;
    }
    inxbuild() {
        let i = 0, j, p, q, smallpos, smallval, previouscol = 0, startpos = 0;
        for (i; i < 256; i++) {
            p = this.network[i];
            smallpos = i;
            smallval = p[1];
            for (j = i + 1; j < 256; j++) {
                q = this.network[j];
                if (q[1] < smallval) {
                    smallpos = j;
                    smallval = q[1];
                }
            }
            q = this.network[smallpos];
            if (i != smallpos) {
                j = q[0];
                q[0] = p[0];
                p[0] = j;
                j = q[1];
                q[1] = p[1];
                p[1] = j;
                j = q[2];
                q[2] = p[2];
                p[2] = j;
                j = q[3];
                q[3] = p[3];
                p[3] = j;
            }
            if (smallval != previouscol) {
                this.netindex[previouscol] = (startpos + i) >> 1;
                for (j = previouscol + 1; j < smallval; j++)
                    this.netindex[j] = i;
                previouscol = smallval;
                startpos = i;
            }
        }
        this.netindex[previouscol] = (startpos + 255) >> 1;
        for (j = previouscol + 1; j < 256; j++)
            this.netindex[j] = 255;
    }
    lookupRGB(b, g, r) {
        let a, p, dist;
        let bestd = 1000, best = -1;
        let i = this.netindex[g], j = i - 1;
        while ((i < 256) || (j >= 0)) {
            if (i < 256) {
                p = this.network[i];
                dist = p[1] - g;
                if (dist >= bestd)
                    i = 256;
                else {
                    i++;
                    if (dist < 0)
                        dist = -dist;
                    a = p[0] - b;
                    if (a < 0)
                        a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0)
                            a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
            if (j >= 0) {
                p = this.network[j];
                dist = g - p[1];
                if (dist >= bestd)
                    j = -1;
                else {
                    j--;
                    if (dist < 0)
                        dist = -dist;
                    a = p[0] - b;
                    if (a < 0)
                        a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0)
                            a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
        }
        return best;
    }
    learn() {
        let i;
        const lengthcount = this.pixels.length;
        const alphadec = 30 + ((this.samplefac - 1) / 3);
        const samplepixels = lengthcount / (3 * this.samplefac);
        let delta = ~~(samplepixels / 100);
        let alpha = (1 << 10);
        let radius = (((256 >> 3) >> 3) * (1 << 6));
        let rad = radius >> 6;
        if (rad <= 1)
            rad = 0;
        for (i = 0; i < rad; i++)
            this.radpower[i] = alpha * (((rad * rad - i * i) * (1 << 6)) / (rad * rad));
        let step;
        if (lengthcount < (3 * 503)) {
            this.samplefac = 1;
            step = 3;
        }
        else if ((lengthcount % 499) !== 0) {
            step = 3 * 499;
        }
        else if ((lengthcount % 491) !== 0) {
            step = 3 * 491;
        }
        else if ((lengthcount % 487) !== 0) {
            step = 3 * 487;
        }
        else {
            step = 3 * 503;
        }
        let b, g, r, j;
        let pix = 0;
        i = 0;
        while (i < samplepixels) {
            b = (this.pixels[pix] & 0xff) << 4;
            g = (this.pixels[pix + 1] & 0xff) << 4;
            r = (this.pixels[pix + 2] & 0xff) << 4;
            j = this.contest(b, g, r);
            this.altersingle(alpha, j, b, g, r);
            if (rad !== 0)
                this.alterneigh(rad, j, b, g, r);
            pix += step;
            if (pix >= lengthcount)
                pix -= lengthcount;
            i++;
            if (delta === 0)
                delta = 1;
            if (i % delta === 0) {
                alpha -= alpha / alphadec;
                radius -= radius / 30;
                rad = radius >> 6;
                if (rad <= 1)
                    rad = 0;
                for (j = 0; j < rad; j++)
                    this.radpower[j] = alpha * (((rad * rad - j * j) * (1 << 8)) / (rad * rad));
            }
        }
    }
    buildColormap() {
        this.init();
        this.learn();
        this.unbiasnet();
        this.inxbuild();
    }
    getColormap() {
        const map = [], index = [];
        for (let i = 0; i < 256; i++)
            index[this.network[i][3]] = i;
        let k = 0;
        for (let l = 0; l < 256; l++) {
            const j = index[l];
            map[k++] = (this.network[j][0]);
            map[k++] = (this.network[j][1]);
            map[k++] = (this.network[j][2]);
        }
        return map;
    }
}
exports.default = ColorMap;
