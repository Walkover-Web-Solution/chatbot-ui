import { Component, Input, OnDestroy } from '@angular/core';
import { BaseComponent } from '@msg91/ui/base-component';
import { IChannel, IChannelAssignees } from '../../../model';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'msg91-old-channel',
    templateUrl: './old-channel.component.html',
    styleUrls: ['./old-channel.component.scss'],
    standalone: false
})
export class OldChannelComponent extends BaseComponent implements OnDestroy {
    @Input() channel: IChannel;
    @Input() assignees: IChannelAssignees;
    appurl: string = environment.appUrl;

    constructor() {
        super();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    public selectChannel(id: string) {
        // this.chatStore.setChatSection(CHAT_SECTION.selectedChannel);
        // this.chatStore.setChannel(id);
    }

    backToChat() {}
}
