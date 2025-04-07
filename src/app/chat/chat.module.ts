import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import {
    ArticlePopupComponent,
    ArticlePopupService,
    ArticlesListComponent,
    ArticlesViewComponent,
    ChannelsListComponent,
    ChatViewComponent,
    ClientInputComponent,
    CreateChannelComponent,
    DateGroupPipe,
    FAQViewComponent,
    FeedbackFormComponent,
    InMessageComponent,
    MessageInputComponent,
    OldChannelComponent,
    OutMessageComponent,
    SelectedChannelComponent,
    TeamListComponent,
} from './chat-widget';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import {
    AgentsTeamEffects,
    BehaviourEffects,
    ChannelsEffect,
    ClientEffects,
    KnowledgeBaseEffect,
    PubnubEffects,
    WidgetInfoEffects,
} from './store/effects';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { PipesSanitizeHtmlPipeModule } from '@msg91/pipes/SanitizeHtmlPipe';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './store';
import { environment } from '../../environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LastConversionPipe } from './chat-widget/components/old-channel/pipes';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiPhoneNumberMaterialModule } from '@msg91/ui/phone-number-material';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProfileNameComponent } from './chat-widget/components/profile-name/profile-name.component';
import { PipesGetHashCodePipeModule } from '@msg91/pipes/GetHashCodePipe';
import { PipesGetShortNamePipeModule } from '@msg91/pipes/GetShortNamePipe';
import { LinkifyPipe, PipesLinkifyPipeModule } from '@msg91/pipes/LinkifyPipe';
import { SocketService, ChatService, WidgetDataService } from './service';
import { PipesTimeConversionPipeModule } from '@msg91/pipes/TimeConversionPipe';
import { ProxyBaseUrls } from '@msg91/models/root-models';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PipesTimeTokenPipeModule } from '@msg91/pipes/TimeTokenPipe';
import { ServicesHttpWrapperModule } from '@msg91/services/httpWrapper';
import { PipesReplaceModule } from '@msg91/pipes/replace';
import { UiBotOptionsModule } from '@msg91/ui/bot-options';
import { UiInteractiveMessageModule } from '@msg91/ui/interactive-message';
import { IdentityVerificationService } from './service/identity-verification.service';
import { DirectivesSkeletonModule } from '@msg91/directives/skeleton';
import { PipesTypeofModule } from '@msg91/pipes/typeof';
import { PipesWhatsappInlineStyleFormatModule, WhatsappInlineStyleFormat } from '@msg91/pipes/whatsapp-inline-style-format';
import { MatDialogModule } from '@angular/material/dialog';
import { ENVIRONMENT_TOKEN } from '@msg91/constant';
import { MatListModule } from '@angular/material/list';

export const CHAT_COMPONENTS: any[] = [
    ChatWidgetComponent,
    ChatViewComponent,
    FAQViewComponent,
    ArticlesListComponent,
    ArticlesViewComponent,
    OldChannelComponent,
    CreateChannelComponent,
    ChannelsListComponent,
    TeamListComponent,
    SelectedChannelComponent,
    InMessageComponent,
    OutMessageComponent,
    FeedbackFormComponent,
    ClientInputComponent,
    MessageInputComponent,
    ArticlePopupComponent,
    DateGroupPipe,
    LastConversionPipe,
];

@NgModule({ declarations: [...CHAT_COMPONENTS, ProfileNameComponent],
    exports: [ChatWidgetComponent, UiPhoneNumberMaterialModule], imports: [CommonModule,
        PipesSanitizeHtmlPipeModule,
        FormsModule,
        EffectsModule.forRoot([
            WidgetInfoEffects,
            ChannelsEffect,
            KnowledgeBaseEffect,
            PubnubEffects,
            AgentsTeamEffects,
            ClientEffects,
            BehaviourEffects,
        ]),
        PipesGetHashCodePipeModule,
        PipesGetShortNamePipeModule,
        DragDropModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        ReactiveFormsModule,
        UiPhoneNumberMaterialModule,
        StoreModule.forRoot(reducers, {
            metaReducers,
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
            },
        }),
        MatProgressSpinnerModule,
        MatProgressBarModule,
        PipesLinkifyPipeModule,
        PipesTimeConversionPipeModule,
        MatTooltipModule,
        PipesTimeTokenPipeModule,
        ServicesHttpWrapperModule,
        PipesReplaceModule,
        UiBotOptionsModule,
        UiInteractiveMessageModule,
        MatDialogModule,
        DirectivesSkeletonModule,
        PipesTypeofModule,
        PipesWhatsappInlineStyleFormatModule,
        MatListModule], providers: [
        ChatService,
        IdentityVerificationService,
        ArticlePopupService,
        SocketService,
        WidgetDataService,
        LinkifyPipe,
        WhatsappInlineStyleFormat,
        { provide: ProxyBaseUrls.Env, useValue: environment.env },
        { provide: ProxyBaseUrls.ProxyURL, useValue: null },
        {
            provide: ProxyBaseUrls.BaseURL,
            useValue: environment.apiUrl,
        },
        { provide: ENVIRONMENT_TOKEN, useValue: environment },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class ChatModule {}