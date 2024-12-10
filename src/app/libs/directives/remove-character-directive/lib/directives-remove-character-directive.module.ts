import { Directive, HostListener, Input, NgModule } from '@angular/core';

@Directive({
    selector: '[msg91RemoveCharacter]',
})
export class RemoveCharacterDirective {
    /** Array of characters to remove */
    @Input() charactersToRemove: Array<string> = ['e', '+', '-'];
    /** Regex to prevent characters of a type from getting input */
    @Input() allowedRegex: string;

    @HostListener('keydown', ['$event'])
    public handleKeyDown(event): void {
        if (
            this.charactersToRemove?.includes(event.key) ||
            (this.allowedRegex &&
                !new RegExp(this.allowedRegex).test(event.key) &&
                event.key !== 'Backspace' &&
                event.key !== 'Delete' &&
                !event.key.startsWith('Arrow') &&
                !event.metaKey &&
                (!event.shiftKey || (event.shiftKey && !event.key.startsWith('Arrow'))) &&
                !event.ctrlKey)
        ) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}

@NgModule({
    imports: [],
    declarations: [RemoveCharacterDirective],
    exports: [RemoveCharacterDirective],
})
export class DirectivesRemoveCharacterDirectiveModule {}
