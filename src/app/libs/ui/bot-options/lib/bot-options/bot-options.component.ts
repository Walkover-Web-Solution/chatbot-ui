import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'msg91-bot-options',
    templateUrl: './bot-options.component.html',
    styleUrls: ['./bot-options.component.scss'],
    standalone: false
})
export class BotOptionsComponent implements OnInit {
    @Input() options: Array<{ name: string; value: any }>;
    @Input() public disableAction: boolean;

    @Output() optionClick = new EventEmitter<{ name: string; value: any }>();

    ngOnInit(): void {}
}
