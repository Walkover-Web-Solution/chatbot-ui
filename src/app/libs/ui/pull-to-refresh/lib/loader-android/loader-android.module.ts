import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoaderAndroidComponent } from './loader-android.component';

@NgModule({
    declarations: [LoaderAndroidComponent],
    imports: [CommonModule],
    exports: [LoaderAndroidComponent],
})
export class LoaderAndroidModule {}
