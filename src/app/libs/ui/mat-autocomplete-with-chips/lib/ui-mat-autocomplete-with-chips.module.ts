import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteWithChipsComponent } from './mat-autocomplete-with-chips/mat-autocomplete-with-chips.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [MatAutocompleteWithChipsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatIconModule,
        MatCheckboxModule,
    ],
    exports: [MatAutocompleteWithChipsComponent],
})
export class UiMatAutocompleteWithChipsModule {}
