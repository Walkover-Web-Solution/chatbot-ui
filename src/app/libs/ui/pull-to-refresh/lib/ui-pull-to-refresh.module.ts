import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobilePullToRefreshComponent } from './mobile-pull-to-refresh-component/mobile-pull-to-refresh-component';
import { PlatformModule } from '@angular/cdk/platform';
import { LoaderAndroidModule } from './loader-android/loader-android.module';
import { LoaderIosModule } from './loader-ios/loader-ios.module';
import { PullToReloadDirective } from './pull-to-reload-directive';
import { OverscrollDirective } from './over-scroll-directive/over-scroll-directive';

@NgModule({
    declarations: [MobilePullToRefreshComponent, PullToReloadDirective, OverscrollDirective],
    imports: [CommonModule, PlatformModule, LoaderAndroidModule, LoaderIosModule],
    exports: [MobilePullToRefreshComponent, PullToReloadDirective, OverscrollDirective],
})
export class UiPullToRefreshModule {}
