import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CodeSnippetDialogComponent } from './code-snippet-dialog/code-snippet-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectivesDarkLightThemeMarkdownDirectiveModule } from '@msg91/directives/dark-light-theme-markdown-directive';
import { UiCopyButtonModule } from '@msg91/ui/copy-button';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MarkdownModule.forRoot(),
        MatTabsModule,
        MatSelectModule,
        ClipboardModule,
        MatTooltipModule,
        UiCopyButtonModule,
        DirectivesDarkLightThemeMarkdownDirectiveModule,
    ],
    declarations: [CodeSnippetDialogComponent],
    exports: [CodeSnippetDialogComponent],
})
export class CodeSnippetDialogModule {}
