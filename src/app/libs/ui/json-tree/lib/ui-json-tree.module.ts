import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonTreeComponent } from './json-tree/json-tree.component';
import { PipesTypeofModule } from '@msg91/pipes/typeof';

@NgModule({
    imports: [CommonModule, PipesTypeofModule, MatCheckboxModule],
    declarations: [JsonTreeComponent],
    exports: [JsonTreeComponent],
})
export class UiJsonTreeModule {}
