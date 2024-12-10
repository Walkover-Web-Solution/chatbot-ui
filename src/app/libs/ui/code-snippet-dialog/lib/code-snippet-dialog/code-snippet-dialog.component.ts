import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrimeNgToastService } from '@msg91/ui/prime-ng-toast';
import { FlowService } from '@msg91/service';
import { returnSnippet } from './code-snippet';
import { errorResolver } from '@msg91/models/root-models';

@Component({
    selector: 'msg91-code-snippet-dialog',
    templateUrl: './code-snippet-dialog.component.html',
    styleUrls: ['./code-snippet-dialog.component.scss'],
})
export class CodeSnippetDialogComponent implements OnInit {
    @Input() data: any;

    public platForm: FormControl<string> = new FormControl('Curl');
    public header: FormControl<string> = new FormControl('authkey');
    public content: string;
    public dryRunAction = '';
    public codeAction = '';
    public codeSnippetWithAction: string;
    public snippetType = returnSnippet();
    public snippetData: any = null;
    public mappingFields: any = null;

    public isLoading: EventEmitter<boolean> = new EventEmitter<boolean>(false);

    constructor(
        private toast: PrimeNgToastService,
        private flowService: FlowService
    ) {}

    ngOnInit(): void {
        this.isLoading.emit(true);
        this.flowService.getCampaignSnippet(this.data.slug).subscribe(
            (res) => {
                if (!res.hasError) {
                    this.snippetData = res.data;
                    this.snippetCreate(this.snippetType.find((e) => e.platform === 'Curl').snippet);
                } else {
                    this.toast.error(errorResolver(res.errors)[0]);
                }
                this.isLoading.emit(false);
            },
            (err) => {
                this.isLoading.emit(false);
            }
        );
    }

    public snippetCreate(snippet: string): void {
        this.codeSnippetWithAction = snippet
            .replace(':id/run', this.snippetData?.endpoint)
            .replace(':headerType', this.header.value)
            .replace(
                ':headerValue',
                this.header.value === 'authkey' ? this.snippetData?.header.authkey : this.snippetData?.header.token
            )
            .replace(':data', JSON.stringify(this.snippetData?.requestBody.data, null, '\t'));
        this.snippetModeChange();
    }

    public snippetModeChange(): void {
        if (this.codeAction?.length) {
            const action = `,\n    "action": "${this.codeAction}"`;
            this.content = this.codeSnippetWithAction.replace(':action', action);
        } else {
            this.content = this.codeSnippetWithAction.replace(':action', '');
        }
    }

    public snippetsChange(): void {
        this.snippetCreate(this.snippetType.find((s) => s.platform === this.platForm.value).snippet);
    }

    public copyDetails(): void {
        this.toast.success('Copied!');
    }
}
