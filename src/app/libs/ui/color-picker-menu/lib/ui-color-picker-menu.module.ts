import { UiColorPickerModule } from '@msg91/ui/color-picker';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerMenuComponent } from './color-picker-menu/color-picker-menu.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [CommonModule, MatMenuModule, MatButtonModule, MatIconModule, UiColorPickerModule],
    declarations: [ColorPickerMenuComponent],
    exports: [MatMenuModule, ColorPickerMenuComponent],
})
export class UiColorPickerMenuModule {}
