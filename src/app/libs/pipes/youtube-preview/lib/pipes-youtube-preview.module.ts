import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpWrapperService } from '@msg91/services/httpWrapper';
import { BehaviorSubject } from 'rxjs';

interface IYoutubePreview {
    title: string;
    author_name: string;
    author_url: string;
    type: string;
    height: number;
    width: number;
    version: string;
    provider_name: string;
    provider_url: string;
    thumbnail_height: number;
    thumbnail_width: number;
    thumbnail_url: string;
    html: string;
}

@Pipe({
    name: 'youtubePreview',
    pure: false,
})
export class YoutubePreviewPipe implements PipeTransform {
    private data = new BehaviorSubject<IYoutubePreview>(null);
    private cachedUrl = '';
    constructor(private http: HttpWrapperService) {}
    transform(url: string): BehaviorSubject<IYoutubePreview> {
        const reqUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;
        if (reqUrl !== this.cachedUrl) {
            this.data.next(null);
            this.cachedUrl = reqUrl;
            this.http
                .get<IYoutubePreview>(reqUrl, null, { withCredentials: false, noNeedToAddProxy: true })
                .subscribe((res) => this.data.next(res));
        }
        return this.data;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [YoutubePreviewPipe],
    exports: [YoutubePreviewPipe],
    providers: [YoutubePreviewPipe],
})
export class PipesYoutubePreviewModule {}
