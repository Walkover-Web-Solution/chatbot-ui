import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonService } from '@admin/src/app/services/common/common.service';

@NgModule({
    declarations: [LoaderComponent],
    imports: [CommonModule, MatProgressSpinnerModule],
    exports: [LoaderComponent],
    providers: [CommonService],
})
export class UiLoaderModule {}
