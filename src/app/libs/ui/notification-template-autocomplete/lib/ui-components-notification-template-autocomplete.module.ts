import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationTemplateDropDownComponent } from './notification-template-autocomplete/notification-template-autocomplete.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServicesMsg91NotificationsModule } from '@msg91/services/msg91/notifications';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UiVirtualScrollModule } from '@msg91/ui/virtual-scroll';
import { MatInputModule } from '@angular/material/input';
import { DirectivesLoaderButtonModule } from '@msg91/directives/loader-button';
import { DirectivesCloseDropdownOnEscapeModule } from '@msg91/directives/close-dropdown-on-escape';

@NgModule({
    declarations: [NotificationTemplateDropDownComponent],
    imports: [
        CommonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatAutocompleteModule,
        UiVirtualScrollModule,
        DirectivesLoaderButtonModule,
        ServicesMsg91NotificationsModule,
        DirectivesCloseDropdownOnEscapeModule,
    ],
    exports: [NotificationTemplateDropDownComponent],
})
export class UiComponentsNotificationTemplateAutocompleteModule {}
