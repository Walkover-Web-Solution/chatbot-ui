import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'parseJson',
})
export class ParseJsonPipe implements PipeTransform {
    transform(value: string): any {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.error('Error while parsing =>' + value);
            return null;
        }
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [ParseJsonPipe],
    exports: [ParseJsonPipe],
    providers: [ParseJsonPipe],
})
export class PipesParseJsonModule {}
