import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'msg91-color-picker-menu',
    templateUrl: './color-picker-menu.component.html',
    styleUrls: ['./color-picker-menu.component.scss'],
})
export class ColorPickerMenuComponent {
    public colorsSet = new Set([
        '#f2ca55',
        '#de8644',
        '#cc5229',
        '#29a653',
        '#24b2b2',
        '#26a5e4',
        '#1a73e8',
        '#1e75ba',
        '#3f51b5',
        '#e55ca1',
        '#aa50f6',
        '#696bef',
        '#3f4346',
        '#d5d9dc',
    ]);
    @Input() public selectedColor: string;
    @Output() public selectedColorChange = new EventEmitter<string>();

    emit() {
        this.selectedColorChange.emit(this.selectedColor);
    }
}
