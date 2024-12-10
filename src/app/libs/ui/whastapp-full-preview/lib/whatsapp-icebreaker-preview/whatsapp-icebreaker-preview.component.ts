import { Component, Input } from '@angular/core';

@Component({
    selector: 'msg91-whatsapp-icebreaker-preview',
    templateUrl: './whatsapp-icebreaker-preview.component.html',
    styleUrls: ['./whatsapp-icebreaker-preview.component.scss'],
})
export class WhatsappIcebreakerPreviewComponent {
    @Input() icebreakers: string[];
    @Input() commands: [];
    @Input() type: string;
    @Input() number: number;
}
