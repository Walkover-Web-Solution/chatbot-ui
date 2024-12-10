import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService, ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { Injectable } from '@angular/core';
import { applyStyle } from './apply-style';
import { cloneNode } from './clone/clone-node';
import { embedImages } from './embed/embed-images';
import { embedWebFonts, getWebFontCSS } from './embed/embed-webfonts';
import { Options } from './types';
import { canvasToBlob, checkCanvasDimensions, createImage, getImageSize, getPixelRatio, nodeToDataURL } from './util';
import { HttpClient } from '@angular/common/http';

@NgModule({
    imports: [CommonModule, ServicesHttpWrapperModule],
})
export class HtmlToImageModule {}

@Injectable({
    providedIn: HtmlToImageModule,
})
export class HtmlToImageService {
    constructor(private httpWrapperService: HttpClient) {}

    public async toSvg<T extends HTMLElement>(node: T, options: Options = {}): Promise<string> {
        this.setHttpWrapperToOptions(options);
        const { width, height } = getImageSize(node, options);
        console.log('passed from getImageSize');
        const clonedNode = (await cloneNode(node, options, true)) as HTMLElement;
        console.log('passed from cloneNode');
        if (clonedNode.style.display === 'none') {
            clonedNode.style.display = 'block';
        }
        await embedWebFonts(clonedNode, options);
        console.log('passed from embedWebFonts');
        await embedImages(clonedNode, options);
        console.log('passed from embedImages');
        applyStyle(clonedNode, options);
        console.log('passed from apply style');
        const datauri = await nodeToDataURL(clonedNode, width, height);
        return datauri;
    }

    public async toCanvas<T extends HTMLElement>(node: T, options: Options = {}): Promise<HTMLCanvasElement> {
        const { width, height } = getImageSize(node, options);
        const svg = await this.toSvg(node, options);
        const img = await createImage(svg);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const ratio = options.pixelRatio || getPixelRatio();
        const canvasWidth = options.canvasWidth || width;
        const canvasHeight = options.canvasHeight || height;

        canvas.width = canvasWidth * ratio;
        canvas.height = canvasHeight * ratio;

        if (!options.skipAutoScale) {
            checkCanvasDimensions(canvas);
        }
        canvas.style.width = `${canvasWidth}`;
        canvas.style.height = `${canvasHeight}`;

        if (options.backgroundColor) {
            context.fillStyle = options.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        return canvas;
    }

    public async toPixelData<T extends HTMLElement>(node: T, options: Options = {}): Promise<Uint8ClampedArray> {
        const { width, height } = getImageSize(node, options);
        const canvas = await this.toCanvas(node, options);
        const ctx = canvas.getContext('2d')!;
        return ctx.getImageData(0, 0, width, height).data;
    }

    public async toPng<T extends HTMLElement>(node: T, options: Options = {}): Promise<string> {
        const canvas = await this.toCanvas(node, options);
        return canvas.toDataURL();
    }

    public async toJpeg<T extends HTMLElement>(node: T, options: Options = {}): Promise<string> {
        const canvas = await this.toCanvas(node, options);
        return canvas.toDataURL('image/jpeg', options.quality || 1);
    }

    public async toBlob<T extends HTMLElement>(node: T, options: Options = {}): Promise<Blob | null> {
        const canvas = await this.toCanvas(node, options);
        const blob = await canvasToBlob(canvas);
        return blob;
    }

    public async getFontEmbedCSS<T extends HTMLElement>(node: T, options: Options = {}): Promise<string> {
        this.setHttpWrapperToOptions(options);
        return getWebFontCSS(node, options);
    }

    private setHttpWrapperToOptions(options: Options) {
        if (!options.httpWrapperServiceRef) {
            options.httpWrapperServiceRef = this.httpWrapperService;
        }
    }
}
