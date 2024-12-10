import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'percentage',
})
export class PercentagePipe implements PipeTransform {
    transform(
        value: string,
        total: string,
        roundUptoDecimal: number = 2,
        returnWithPercentage: boolean = true
    ): string {
        return ((+value / (+total || 1)) * 100 ?? 0).toFixed(roundUptoDecimal) + (returnWithPercentage ? '%' : '');
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [PercentagePipe],
    exports: [PercentagePipe],
    providers: [PercentagePipe],
})
export class PipesPercentageModule {}
