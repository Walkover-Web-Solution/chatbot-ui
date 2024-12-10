import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { InteractiveMessageSectionComponent } from './interactive-message-section/interactive-message-section.component';
import { ServicesMsg91WhatsappModule } from '@msg91/services/msg91/whatsapp';

@NgModule({
    declarations: [InteractiveMessageSectionComponent],
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatIconModule,
        DragDropModule,
        ServicesMsg91WhatsappModule,
    ],
    exports: [InteractiveMessageSectionComponent],
})
export class UiInteractiveMessageSectionModule {}
