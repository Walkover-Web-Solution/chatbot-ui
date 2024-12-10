import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@msg91/ui/base-component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

const Imports = [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
];

@Component({
    standalone: true,
    selector: 'msg91-mat-input',
    templateUrl: './msg91-mat-input.component.html',
    styleUrls: ['./msg91-mat-input.component.scss'],
    imports: Imports,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Msg91MatInputComponent extends BaseComponent {
    @Input() control: FormControl;
    @Input() showLabel: boolean = false;
    @Input() labelText: string = '';
    @Input() type: string = 'text';
    @Input() placeholder: string = 'Enter a value';
    @Input() class: string | string[] = '';
    @Input() appearance: string = 'outline';
    @Input() showError: boolean = true;
    @Input() showErrorIntoMatFormField: boolean = true;
    @Input() tooltipMessage: string;
    @Input() tooltipPosition: string = 'above';
    @Input() tooltipDisabled: boolean = false;
    @Input() controlErrorsMessage: { [key: string]: string } = {};
    // @Input() iconString: string = 'percent';
    @Input() icon: {
        string: string | null;
        isPrefix: boolean;
        isSuffix: boolean;
        spanString: boolean;
    } = {
        string: null,
        isPrefix: false,
        isSuffix: false,
        spanString: false,
    };

    constructor() {
        super();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
