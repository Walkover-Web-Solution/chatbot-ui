import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoaderIOSComponent } from './loader-ios.component';

@NgModule({
    declarations: [LoaderIOSComponent],
    imports: [CommonModule],
    exports: [LoaderIOSComponent],
})
export class LoaderIosModule {}
